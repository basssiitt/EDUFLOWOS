import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal, jsonb, pgEnum, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ==================== ENUMS ====================

export const userRoleEnum = pgEnum('user_role', ['super_admin', 'school_admin', 'teacher', 'parent']);
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);
export const attendanceStatusEnum = pgEnum('attendance_status', ['present', 'absent', 'late', 'excused']);
export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'paid', 'overdue', 'cancelled', 'partial']);
export const paymentMethodEnum = pgEnum('payment_method', ['bank_transfer', 'card', '1link_1bill', 'payfast', 'apps', 'cash', 'other']);
export const examTypeEnum = pgEnum('exam_type', ['quiz', 'assignment', 'midterm', 'final', 'project']);
export const notificationChannelEnum = pgEnum('notification_channel', ['whatsapp', 'sms', 'email', 'push']);
export const notificationStatusEnum = pgEnum('notification_status', ['pending', 'sent', 'delivered', 'failed']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'basic', 'premium', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'expired', 'cancelled', 'trial']);

// ==================== CORE TABLES ====================

// Schools (Tenants)
export const schools = pgTable('schools', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  logoUrl: text('logo_url'),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').default('free'),
  subscriptionStatus: subscriptionStatusEnum('subscription_status').default('trial'),
  subscriptionExpiresAt: timestamp('subscription_expires_at'),
  settings: jsonb('settings').default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Users
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash'),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull(),
  schoolId: uuid('school_id').references(() => schools.id, { onDelete: 'cascade' }),
  phone: varchar('phone', { length: 20 }),
  avatarUrl: text('avatar_url'),
  isActive: boolean('is_active').default(true),
  emailVerified: timestamp('email_verified'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_users_school_id').on(table.schoolId),
  index('idx_users_email').on(table.email),
  index('idx_users_role').on(table.role),
]);

// Academic Years
export const academicYears = pgTable('academic_years', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(), // e.g., "2024-2025"
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isCurrent: boolean('is_current').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_academic_years_school_id').on(table.schoolId),
]);

// Classes/Grades
export const classes = pgTable('classes', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(), // e.g., "Grade 1", "Class 10"
  gradeLevel: integer('grade_level').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_classes_school_id').on(table.schoolId),
]);

// Sections
export const sections = pgTable('sections', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').notNull().references(() => classes.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 50 }).notNull(), // e.g., "A", "B", "Blue"
  capacity: integer('capacity').default(40),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_sections_class_id').on(table.classId),
]);

// Subjects
export const subjects = pgTable('subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  code: varchar('code', { length: 20 }),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Teacher-Subject-Section assignments
export const teacherAssignments = pgTable('teacher_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  teacherId: uuid('teacher_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id').notNull().references(() => sections.id, { onDelete: 'cascade' }),
  academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_teacher_subject_section').on(table.teacherId, table.subjectId, table.sectionId),
]);

// ==================== STUDENT TABLES ====================

// Students
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id), // optional link to user account
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  gender: genderEnum('gender').notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  sectionId: uuid('section_id').notNull().references(() => sections.id),
  rollNumber: varchar('roll_number', { length: 20 }).notNull(),
  admissionDate: timestamp('admission_date').defaultNow(),
  photoUrl: text('photo_url'),
  address: text('address'),
  medicalNotes: text('medical_notes'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_students_school_id').on(table.schoolId),
  index('idx_students_section_id').on(table.sectionId),
  uniqueIndex('idx_students_roll_number_section').on(table.rollNumber, table.sectionId),
]);

// Parent-Student relationships
export const parentStudents = pgTable('parent_students', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  relationship: varchar('relationship', { length: 50 }).notNull(), // father, mother, guardian
  isPrimary: boolean('is_primary').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_parent_student').on(table.parentId, table.studentId),
]);

// ==================== ATTENDANCE ====================

export const attendance = pgTable('attendance', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id').notNull().references(() => sections.id),
  date: timestamp('date').notNull(),
  status: attendanceStatusEnum('status').notNull().default('present'),
  markedBy: uuid('marked_by').notNull().references(() => users.id),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_attendance_student_date').on(table.studentId, table.date),
  index('idx_attendance_section_date').on(table.sectionId, table.date),
]);

// ==================== DIARY / HOMEWORK ====================

export const diaryEntries = pgTable('diary_entries', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  sectionId: uuid('section_id').notNull().references(() => sections.id),
  subjectId: uuid('subject_id').references(() => subjects.id),
  teacherId: uuid('teacher_id').notNull().references(() => users.id),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  entryDate: timestamp('entry_date').notNull(),
  dueDate: timestamp('due_date'),
  attachments: jsonb('attachments').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  index('idx_diary_section_date').on(table.sectionId, table.entryDate),
]);

// ==================== GRADES / EXAMS ====================

export const exams = pgTable('exams', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  academicYearId: uuid('academic_year_id').notNull().references(() => academicYears.id),
  name: varchar('name', { length: 100 }).notNull(),
  examType: examTypeEnum('exam_type').notNull(),
  term: varchar('term', { length: 50 }),
  startDate: timestamp('start_date'),
  endDate: timestamp('end_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const examSubjects = pgTable('exam_subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  examId: uuid('exam_id').notNull().references(() => exams.id, { onDelete: 'cascade' }),
  subjectId: uuid('subject_id').notNull().references(() => subjects.id),
  totalMarks: integer('total_marks').notNull().default(100),
  passingMarks: integer('passing_marks').notNull().default(40),
  examDate: timestamp('exam_date'),
});

export const grades = pgTable('grades', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  examSubjectId: uuid('exam_subject_id').notNull().references(() => examSubjects.id, { onDelete: 'cascade' }),
  marksObtained: decimal('marks_obtained', { precision: 5, scale: 2 }).notNull(),
  grade: varchar('grade', { length: 5 }), // A+, A, B+, etc.
  gpa: decimal('gpa', { precision: 3, scale: 2 }),
  remarks: text('remarks'),
  enteredBy: uuid('entered_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_grades_student_exam_subject').on(table.studentId, table.examSubjectId),
]);

// ==================== FINANCIAL TABLES ====================

// Fee Structure
export const feeStructures = pgTable('fee_structures', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  classId: uuid('class_id').references(() => classes.id),
  name: varchar('name', { length: 100 }).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  feeType: varchar('fee_type', { length: 50 }).notNull(), // tuition, transport, lab, library
  isRecurring: boolean('is_recurring').default(true),
  dueDayOfMonth: integer('due_day_of_month').default(1),
  lateFeeAmount: decimal('late_fee_amount', { precision: 10, scale: 2 }).default('0'),
  lateFeeDaysAfterDue: integer('late_fee_days_after_due').default(7),
  academicYearId: uuid('academic_year_id').references(() => academicYears.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Student Concessions/Scholarships
export const studentConcessions = pgTable('student_concessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  feeStructureId: uuid('fee_structure_id').notNull().references(() => feeStructures.id),
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  reason: text('reason'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Invoices (Monthly Fee Vouchers)
export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull(),
  month: integer('month').notNull(),
  year: integer('year').notNull(),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  lateFee: decimal('late_fee', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
  status: invoiceStatusEnum('status').default('pending'),
  dueDate: timestamp('due_date').notNull(),
  paidAt: timestamp('paid_at'),
  lineItems: jsonb('line_items').default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => [
  uniqueIndex('idx_invoices_number').on(table.invoiceNumber),
  index('idx_invoices_student').on(table.studentId),
  index('idx_invoices_school_month').on(table.schoolId, table.month, table.year),
]);

// Payments
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  invoiceId: uuid('invoice_id').notNull().references(() => invoices.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: paymentMethodEnum('payment_method').notNull(),
  transactionReference: varchar('transaction_reference', { length: 255 }),
  gatewayResponse: jsonb('gateway_response'),
  paidBy: uuid('paid_by').references(() => users.id),
  paidAt: timestamp('paid_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Expenses
export const expenses = pgTable('expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  category: varchar('category', { length: 100 }).notNull(), // payroll, rent, utilities, supplies, other
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  expenseDate: timestamp('expense_date').notNull(),
  receiptUrl: text('receipt_url'),
  approvedBy: uuid('approved_by').references(() => users.id),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_expenses_school_date').on(table.schoolId, table.expenseDate),
  index('idx_expenses_category').on(table.category),
]);

// ==================== NOTIFICATIONS ====================

export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id),
  channel: notificationChannelEnum('channel').notNull(),
  status: notificationStatusEnum('status').default('pending'),
  templateKey: varchar('template_key', { length: 100 }),
  recipientAddress: varchar('recipient_address', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 255 }),
  body: text('body').notNull(),
  metadata: jsonb('metadata').default({}),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_notifications_user').on(table.userId),
  index('idx_notifications_status').on(table.status),
]);

// ==================== AUDIT LOG ====================

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').references(() => schools.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id'),
  diffPayload: jsonb('diff_payload'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => [
  index('idx_audit_school').on(table.schoolId),
  index('idx_audit_user').on(table.userId),
  index('idx_audit_entity').on(table.entityType, table.entityId),
]);

// ==================== AI COUNSELOR ====================

export const aiConversations = pgTable('ai_conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  parentId: uuid('parent_id').notNull().references(() => users.id),
  studentId: uuid('student_id').notNull().references(() => students.id),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastMessageAt: timestamp('last_message_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const aiMessages = pgTable('ai_messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').notNull().references(() => aiConversations.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // user, assistant
  content: text('content').notNull(),
  tokensUsed: integer('tokens_used'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ==================== SUBSCRIPTION MANAGEMENT ====================

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  schoolId: uuid('school_id').notNull().references(() => schools.id, { onDelete: 'cascade' }),
  plan: subscriptionPlanEnum('plan').notNull(),
  status: subscriptionStatusEnum('status').default('active'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  amount: decimal('amount', { precision: 10, scale: 2 }),
  paymentReference: varchar('payment_reference', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ==================== RELATIONS ====================

export const schoolsRelations = relations(schools, ({ many }) => ({
  users: many(users),
  students: many(students),
  classes: many(classes),
  subjects: many(subjects),
  invoices: many(invoices),
  expenses: many(expenses),
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  school: one(schools, { fields: [users.schoolId], references: [schools.id] }),
  studentLinks: many(parentStudents),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  school: one(schools, { fields: [students.schoolId], references: [schools.id] }),
  section: one(sections, { fields: [students.sectionId], references: [sections.id] }),
  parentLinks: many(parentStudents),
  attendance: many(attendance),
  grades: many(grades),
  invoices: many(invoices),
}));

export const classesRelations = relations(classes, ({ one, many }) => ({
  school: one(schools, { fields: [classes.schoolId], references: [schools.id] }),
  sections: many(sections),
}));

export const sectionsRelations = relations(sections, ({ one, many }) => ({
  class: one(classes, { fields: [sections.classId], references: [classes.id] }),
  students: many(students),
  diaryEntries: many(diaryEntries),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  school: one(schools, { fields: [invoices.schoolId], references: [schools.id] }),
  student: one(students, { fields: [invoices.studentId], references: [students.id] }),
  payments: many(payments),
}));
