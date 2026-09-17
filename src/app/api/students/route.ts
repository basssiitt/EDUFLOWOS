import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { db } from '@/lib/db';
import { students, parentStudents, users, sections, classes } from '@/lib/db/schema';
import { eq, and, like, or } from 'drizzle-orm';
import { studentSchema } from '@/lib/validators';
import { logStudentCreation } from '@/lib/services/audit';

// GET /api/students - List students
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const schoolId = user.schoolId!;
  const search = searchParams.get('search') || '';
  const sectionId = searchParams.get('sectionId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = db.query.students.findMany({
    where: (students, { eq, and, like, or }) => {
      const conditions = [eq(students.schoolId, schoolId)];
      
      if (search) {
        conditions.push(
          or(
            like(students.firstName, `%${search}%`),
            like(students.lastName, `%${search}%`),
            like(students.rollNumber, `%${search}%`)
          )!
        );
      }
      
      if (sectionId) {
        conditions.push(eq(students.sectionId, sectionId));
      }
      
      return and(...conditions);
    },
    with: {
      section: {
        with: {
          class: true,
        },
      },
      parentLinks: {
        with: {
          // parent: true, // Would need proper relation
        },
      },
    },
    limit,
    offset: (page - 1) * limit,
    orderBy: (students, { asc }) => [asc(students.firstName)],
  });

  const data = await query;
  
  return NextResponse.json({ students: data });
}, { roles: ['school_admin', 'teacher'] });

// POST /api/students - Create student
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const validation = studentSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.errors },
      { status: 400 }
    );
  }

  const data = validation.data;
  const schoolId = user.schoolId!;

  // Check for duplicate roll number in section
  const existing = await db.query.students.findFirst({
    where: and(
      eq(students.sectionId, data.sectionId),
      eq(students.rollNumber, data.rollNumber)
    ),
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Roll number already exists in this section' },
      { status: 409 }
    );
  }

  // Create student
  const [newStudent] = await db.insert(students).values({
    schoolId,
    firstName: data.firstName,
    lastName: data.lastName,
    gender: data.gender,
    dateOfBirth: new Date(data.dateOfBirth),
    sectionId: data.sectionId,
    rollNumber: data.rollNumber,
    address: data.address,
    medicalNotes: data.medicalNotes,
    isActive: true,
  }).returning();

  // Create guardian account if provided
  if (data.guardianEmail && data.guardianName) {
    let guardian = await db.query.users.findFirst({
      where: eq(users.email, data.guardianEmail.toLowerCase()),
    });

    if (!guardian) {
      const { generateTemporaryPassword } = await import('@/lib/utils');
      const bcrypt = require('bcryptjs');
      const tempPassword = generateTemporaryPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      const [newGuardian] = await db.insert(users).values({
        email: data.guardianEmail.toLowerCase(),
        firstName: data.guardianName.split(' ')[0] || data.guardianName,
        lastName: data.guardianName.split(' ').slice(1).join(' ') || '.',
        role: 'parent',
        schoolId,
        phone: data.guardianPhone,
        passwordHash,
        isActive: true,
      }).returning();

      guardian = newGuardian;
    }

    // Link guardian to student
    await db.insert(parentStudents).values({
      schoolId,
      parentId: guardian!.id,
      studentId: newStudent.id,
      relationship: 'guardian',
      isPrimary: true,
    });
  }

  // Audit log
  await logStudentCreation(schoolId, user.id, newStudent.id, {
    firstName: data.firstName,
    lastName: data.lastName,
    rollNumber: data.rollNumber,
  });

  return NextResponse.json({ student: newStudent }, { status: 201 });
}, { roles: ['school_admin'] });
