import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';

interface AuditLogEntry {
  schoolId?: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  diffPayload?: any;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(entry: AuditLogEntry) {
  try {
    await db.insert(auditLogs).values({
      schoolId: entry.schoolId,
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      diffPayload: entry.diffPayload,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break the main operation
  }
}

export async function logBulkImport(
  schoolId: string,
  userId: string,
  recordCount: number,
  errors: string[]
) {
  await createAuditLog({
    schoolId,
    userId,
    action: 'bulk_import',
    entityType: 'students',
    diffPayload: {
      recordCount,
      errorCount: errors.length,
      errors: errors.slice(0, 10), // Store first 10 errors
    },
  });
}

export async function logFeeAdjustment(
  schoolId: string,
  userId: string,
  studentId: string,
  oldAmount: number,
  newAmount: number,
  reason: string
) {
  await createAuditLog({
    schoolId,
    userId,
    action: 'fee_adjustment',
    entityType: 'invoice',
    entityId: studentId,
    diffPayload: {
      oldAmount,
      newAmount,
      reason,
    },
  });
}

export async function logGradeModification(
  schoolId: string,
  userId: string,
  gradeId: string,
  oldMarks: number,
  newMarks: number
) {
  await createAuditLog({
    schoolId,
    userId,
    action: 'grade_modification',
    entityType: 'grade',
    entityId: gradeId,
    diffPayload: {
      oldMarks,
      newMarks,
    },
  });
}

export async function logExpenseAddition(
  schoolId: string,
  userId: string,
  expenseId: string,
  amount: number,
  category: string
) {
  await createAuditLog({
    schoolId,
    userId,
    action: 'expense_added',
    entityType: 'expense',
    entityId: expenseId,
    diffPayload: {
      amount,
      category,
    },
  });
}

export async function logStudentCreation(
  schoolId: string,
  userId: string,
  studentId: string,
  studentData: any
) {
  await createAuditLog({
    schoolId,
    userId,
    action: 'student_created',
    entityType: 'student',
    entityId: studentId,
    diffPayload: studentData,
  });
}

export async function logAttendanceSubmission(
  schoolId: string,
  userId: string,
  sectionId: string,
  date: string,
  stats: { present: number; absent: number; late: number }
) {
  await createAuditLog({
    schoolId,
    userId,
    action: 'attendance_submitted',
    entityType: 'attendance',
    entityId: sectionId,
    diffPayload: {
      date,
      ...stats,
    },
  });
}

export async function getAuditLogs(
  schoolId: string,
  filters?: {
    entityType?: string;
    action?: string;
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page: number = 1,
  limit: number = 50
) {
  const offset = (page - 1) * limit;

  let query = db.query.auditLogs.findMany({
    where: (logs, { eq, and, gte, lte }) => {
      const conditions = [eq(logs.schoolId, schoolId)];
      
      if (filters?.entityType) {
        conditions.push(eq(logs.entityType, filters.entityType));
      }
      if (filters?.action) {
        conditions.push(eq(logs.action, filters.action));
      }
      if (filters?.userId) {
        conditions.push(eq(logs.userId, filters.userId));
      }
      if (filters?.startDate) {
        conditions.push(gte(logs.createdAt, filters.startDate));
      }
      if (filters?.endDate) {
        conditions.push(lte(logs.createdAt, filters.endDate));
      }
      
      return and(...conditions);
    },
    orderBy: (logs, { desc }) => [desc(logs.createdAt)],
    limit,
    offset,
    with: {
      // You could add user relation here if needed
    },
  });

  return query;
}
