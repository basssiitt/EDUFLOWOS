import { z } from 'zod';

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchoolSchema = z.object({
  schoolName: z.string().min(2, 'School name must be at least 2 characters'),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  ownerFirstName: z.string().min(1, 'First name is required'),
  ownerLastName: z.string().min(1, 'Last name is required'),
  ownerEmail: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ==================== STUDENT SCHEMAS ====================

export const studentSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  gender: z.enum(['male', 'female', 'other']),
  dateOfBirth: z.string().or(z.date()),
  sectionId: z.string().uuid('Invalid section'),
  rollNumber: z.string().min(1, 'Roll number is required'),
  guardianName: z.string().optional(),
  guardianEmail: z.string().email().optional(),
  guardianPhone: z.string().optional(),
  address: z.string().optional(),
  medicalNotes: z.string().optional(),
});

export const csvStudentRowSchema = z.object({
  'First Name': z.string().min(1, 'First name is required'),
  'Last Name': z.string().min(1, 'Last name is required'),
  'Gender': z.enum(['Male', 'Female', 'Other'], { required_error: 'Gender is required' }),
  'DOB': z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  'Grade/Class': z.string().min(1, 'Grade/Class is required'),
  'Section': z.string().min(1, 'Section is required'),
  'Roll Number': z.string().min(1, 'Roll number is required'),
  'Guardian Name': z.string().min(1, 'Guardian name is required'),
  'Guardian Email': z.string().email('Invalid guardian email'),
  'Guardian Phone': z.string().min(10, 'Phone must be at least 10 digits'),
});

export const csvImportSchema = z.object({
  rows: z.array(csvStudentRowSchema).min(1, 'At least one student is required'),
});

// ==================== ACADEMIC SCHEMAS ====================

export const attendanceSchema = z.object({
  sectionId: z.string().uuid(),
  date: z.string().or(z.date()),
  records: z.array(z.object({
    studentId: z.string().uuid(),
    status: z.enum(['present', 'absent', 'late', 'excused']),
    notes: z.string().optional(),
  })),
});

export const diaryEntrySchema = z.object({
  sectionId: z.string().uuid(),
  subjectId: z.string().uuid().optional(),
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().min(1, 'Content is required'),
  entryDate: z.string().or(z.date()),
  dueDate: z.string().or(z.date()).optional(),
});

export const examSchema = z.object({
  name: z.string().min(1, 'Exam name is required'),
  examType: z.enum(['quiz', 'assignment', 'midterm', 'final', 'project']),
  term: z.string().optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
});

export const gradeSchema = z.object({
  studentId: z.string().uuid(),
  examSubjectId: z.string().uuid(),
  marksObtained: z.number().min(0),
  remarks: z.string().optional(),
});

// ==================== FINANCIAL SCHEMAS ====================

export const feeStructureSchema = z.object({
  classId: z.string().uuid().optional(),
  name: z.string().min(1, 'Fee name is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  feeType: z.enum(['tuition', 'transport', 'lab', 'library', 'exam', 'activity', 'other']),
  isRecurring: z.boolean().default(true),
  dueDayOfMonth: z.number().min(1).max(28).default(1),
  lateFeeAmount: z.number().min(0).default(0),
  lateFeeDaysAfterDue: z.number().min(1).default(7),
});

export const expenseSchema = z.object({
  category: z.enum(['payroll', 'rent', 'utilities', 'supplies', 'maintenance', 'marketing', 'other']),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  expenseDate: z.string().or(z.date()),
});

export const invoiceSchema = z.object({
  studentId: z.string().uuid(),
  month: z.number().min(1).max(12),
  year: z.number().min(2024).max(2100),
  lineItems: z.array(z.object({
    feeStructureId: z.string().uuid(),
    amount: z.number().min(0),
    description: z.string(),
  })),
});

export const paymentSchema = z.object({
  invoiceId: z.string().uuid(),
  amount: z.number().min(0),
  paymentMethod: z.enum(['bank_transfer', 'card', '1link_1bill', 'payfast', 'apps', 'cash', 'other']),
  transactionReference: z.string().optional(),
});

// ==================== SETTINGS SCHEMAS ====================

export const schoolSettingsSchema = z.object({
  name: z.string().min(1, 'School name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  academicYearStartMonth: z.number().min(1).max(12).default(8),
  workingDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]),
  timezone: z.string().default('Asia/Karachi'),
  currency: z.string().default('PKR'),
  lateFeePolicy: z.object({
    enabled: z.boolean().default(true),
    gracePeriodDays: z.number().min(0).default(7),
    penaltyPercent: z.number().min(0).max(100).default(5),
  }),
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterSchoolInput = z.infer<typeof registerSchoolSchema>;
export type StudentInput = z.infer<typeof studentSchema>;
export type CsvStudentRow = z.infer<typeof csvStudentRowSchema>;
export type AttendanceInput = z.infer<typeof attendanceSchema>;
export type DiaryEntryInput = z.infer<typeof diaryEntrySchema>;
export type GradeInput = z.infer<typeof gradeSchema>;
export type FeeStructureInput = z.infer<typeof feeStructureSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SchoolSettingsInput = z.infer<typeof schoolSettingsSchema>;
