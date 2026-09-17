import { db } from '@/lib/db';
import { students, users, parentStudents, classes, sections } from '@/lib/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { CsvStudentRow, csvStudentRowSchema } from '@/lib/validators';
import { generateTemporaryPassword } from '@/lib/utils';
import { logBulkImport } from './audit';
import { sendNotification } from './notifications';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

interface ValidationResult {
  valid: boolean;
  data: CsvStudentRow[];
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    row: number;
    message: string;
  }>;
}

interface ImportResult {
  success: boolean;
  studentsCreated: number;
  parentsCreated: number;
  credentials: Array<{
    studentName: string;
    guardianName: string;
    guardianEmail: string;
    temporaryPassword: string;
  }>;
  errors: string[];
}

export async function validateCsvData(
  rows: any[],
  schoolId: string
): Promise<ValidationResult> {
  const errors: ValidationResult['errors'] = [];
  const warnings: ValidationResult['warnings'] = [];
  const validRows: CsvStudentRow[] = [];

  // Get existing classes and sections for validation
  const schoolClasses = await db.query.classes.findMany({
    where: eq(classes.schoolId, schoolId),
    with: {
      sections: true,
    },
  });

  const existingStudents = await db.query.students.findMany({
    where: eq(students.schoolId, schoolId),
    columns: { rollNumber: true, sectionId: true },
  });

  const existingRollNumbers = new Set(
    existingStudents.map(s => `${s.sectionId}-${s.rollNumber}`)
  );

  // Track roll numbers within the CSV to detect duplicates
  const csvRollNumbers = new Map<string, number>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because row 1 is header, arrays are 0-indexed

    // Validate using Zod schema
    const result = csvStudentRowSchema.safeParse(row);
    
    if (!result.success) {
      result.error.errors.forEach(err => {
        errors.push({
          row: rowNum,
          field: err.path[0] as string,
          message: err.message,
        });
      });
      continue;
    }

    const validatedRow = result.data;

    // Check for class/section existence
    const matchingClass = schoolClasses.find(c => 
      c.name.toLowerCase() === validatedRow['Grade/Class'].toLowerCase()
    );

    if (!matchingClass) {
      errors.push({
        row: rowNum,
        field: 'Grade/Class',
        message: `Class "${validatedRow['Grade/Class']}" not found`,
      });
      continue;
    }

    const matchingSection = matchingClass.sections?.find(s =>
      s.name.toLowerCase() === validatedRow['Section'].toLowerCase()
    );

    if (!matchingSection) {
      errors.push({
        row: rowNum,
        field: 'Section',
        message: `Section "${validatedRow['Section']}" not found in class "${validatedRow['Grade/Class']}"`,
      });
      continue;
    }

    // Check for duplicate roll numbers in DB
    const rollKey = `${matchingSection.id}-${validatedRow['Roll Number']}`;
    if (existingRollNumbers.has(rollKey)) {
      errors.push({
        row: rowNum,
        field: 'Roll Number',
        message: `Roll number "${validatedRow['Roll Number']}" already exists in this section`,
      });
      continue;
    }

    // Check for duplicate roll numbers within CSV
    const csvRollKey = `${validatedRow['Grade/Class']}-${validatedRow['Section']}-${validatedRow['Roll Number']}`;
    const existingCsvCount = csvRollNumbers.get(csvRollKey) || 0;
    if (existingCsvCount > 0) {
      errors.push({
        row: rowNum,
        field: 'Roll Number',
        message: `Duplicate roll number "${validatedRow['Roll Number']}" in CSV for same class/section`,
      });
      continue;
    }
    csvRollNumbers.set(csvRollKey, existingCsvCount + 1);

    // Validate date format
    const dob = new Date(validatedRow['DOB']);
    if (isNaN(dob.getTime())) {
      errors.push({
        row: rowNum,
        field: 'DOB',
        message: 'Invalid date format',
      });
      continue;
    }

    // Check age (should be between 3-20 for school students)
    const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age < 3 || age > 20) {
      warnings.push({
        row: rowNum,
        message: `Student age (${age}) seems unusual for school enrollment`,
      });
    }

    validRows.push(validatedRow);
  }

  return {
    valid: errors.length === 0,
    data: validRows,
    errors,
    warnings,
  };
}

export async function processCsvImport(
  rows: CsvStudentRow[],
  schoolId: string,
  userId: string
): Promise<ImportResult> {
  const credentials: ImportResult['credentials'] = [];
  const errors: string[] = [];
  let studentsCreated = 0;
  let parentsCreated = 0;

  // Get academic year
  const currentYear = await db.query.academicYears.findFirst({
    where: (years, { and, eq }) => and(
      eq(years.schoolId, schoolId),
      eq(years.isCurrent, true)
    ),
  });

  if (!currentYear) {
    return {
      success: false,
      studentsCreated: 0,
      parentsCreated: 0,
      credentials: [],
      errors: ['No active academic year found. Please create one first.'],
    };
  }

  // Get classes and sections
  const schoolClasses = await db.query.classes.findMany({
    where: eq(classes.schoolId, schoolId),
    with: { sections: true },
  });

  // Group rows by guardian email to avoid duplicate parent accounts
  const guardianMap = new Map<string, {
    name: string;
    email: string;
    phone: string;
    students: CsvStudentRow[];
  }>();

  for (const row of rows) {
    const email = row['Guardian Email'].toLowerCase();
    if (!guardianMap.has(email)) {
      guardianMap.set(email, {
        name: row['Guardian Name'],
        email,
        phone: row['Guardian Phone'],
        students: [],
      });
    }
    guardianMap.get(email)!.students.push(row);
  }

  // Process in transaction
  try {
    await db.transaction(async (tx) => {
      // Create parent accounts
      for (const [email, guardian] of guardianMap) {
        // Check if parent already exists
        let parent = await tx.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!parent) {
          const tempPassword = generateTemporaryPassword();
          const passwordHash = await bcrypt.hash(tempPassword, 12);

          const [newParent] = await tx.insert(users).values({
            email,
            firstName: guardian.name.split(' ')[0] || guardian.name,
            lastName: guardian.name.split(' ').slice(1).join(' ') || '.',
            role: 'parent',
            schoolId,
            phone: guardian.phone,
            passwordHash,
            isActive: true,
          }).returning();

          parent = newParent;
          parentsCreated++;

          credentials.push({
            studentName: guardian.students.map(s => `${s['First Name']} ${s['Last Name']}`).join(', '),
            guardianName: guardian.name,
            guardianEmail: email,
            temporaryPassword: tempPassword,
          });
        }

        // Create student records
        for (const studentRow of guardian.students) {
          const matchingClass = schoolClasses.find(c =>
            c.name.toLowerCase() === studentRow['Grade/Class'].toLowerCase()
          );

          if (!matchingClass) {
            errors.push(`Class "${studentRow['Grade/Class']}" not found`);
            continue;
          }

          const matchingSection = matchingClass.sections?.find(s =>
            s.name.toLowerCase() === studentRow['Section'].toLowerCase()
          );

          if (!matchingSection) {
            errors.push(`Section "${studentRow['Section']}" not found`);
            continue;
          }

          // Create student
          const [newStudent] = await tx.insert(students).values({
            schoolId,
            firstName: studentRow['First Name'],
            lastName: studentRow['Last Name'],
            gender: studentRow['Gender'].toLowerCase() as 'male' | 'female' | 'other',
            dateOfBirth: new Date(studentRow['DOB']),
            sectionId: matchingSection.id,
            rollNumber: studentRow['Roll Number'],
            admissionDate: new Date(),
            isActive: true,
          }).returning();

          // Link parent to student
          await tx.insert(parentStudents).values({
            schoolId,
            parentId: parent.id,
            studentId: newStudent.id,
            relationship: 'guardian',
            isPrimary: true,
          });

          studentsCreated++;
        }
      }
    });

    // Log the bulk import
    await logBulkImport(schoolId, userId, studentsCreated, errors);

    // Send onboarding notifications (async, don't await)
    for (const cred of credentials) {
      sendNotification({
        schoolId,
        channel: 'email',
        recipientAddress: cred.guardianEmail,
        subject: 'Welcome to EduFlow - Your Account Credentials',
        body: `Dear ${cred.guardianName},\n\nYour account has been created on EduFlow.\n\nEmail: ${cred.guardianEmail}\nPassword: ${cred.temporaryPassword}\n\nPlease login and change your password immediately.\n\nStudent(s): ${cred.studentName}`,
        templateKey: 'onboarding',
      }).catch(console.error);
    }

    return {
      success: errors.length === 0,
      studentsCreated,
      parentsCreated,
      credentials,
      errors,
    };
  } catch (error: any) {
    console.error('CSV import error:', error);
    return {
      success: false,
      studentsCreated: 0,
      parentsCreated: 0,
      credentials: [],
      errors: [error.message || 'An unexpected error occurred during import'],
    };
  }
}

export function parseCsvText(csvText: string): any[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const rows: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
    const row: any = {};
    
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    // Skip empty rows
    if (Object.values(row).some(v => v !== '')) {
      rows.push(row);
    }
  }

  return rows;
}
