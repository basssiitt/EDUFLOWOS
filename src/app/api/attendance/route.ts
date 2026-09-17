import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { db } from '@/lib/db';
import { attendance, students, sections } from '@/lib/db/schema';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import { attendanceSchema } from '@/lib/validators';
import { logAttendanceSubmission } from '@/lib/services/audit';
import { sendAttendanceAlert } from '@/lib/services/notifications';

// GET /api/attendance - Get attendance records
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const schoolId = user.schoolId!;
  const sectionId = searchParams.get('sectionId');
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const studentId = searchParams.get('studentId');

  let query = db.query.attendance.findMany({
    where: (att, { eq, and, gte, lte }) => {
      const conditions = [eq(att.schoolId, schoolId)];
      
      if (sectionId) {
        conditions.push(eq(att.sectionId, sectionId));
      }
      if (date) {
        conditions.push(eq(att.date, new Date(date)));
      }
      if (startDate) {
        conditions.push(gte(att.date, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(att.date, new Date(endDate)));
      }
      if (studentId) {
        conditions.push(eq(att.studentId, studentId));
      }
      
      return and(...conditions);
    },
    with: {
      // student: true, // Would need proper relation
    },
    orderBy: (att, { desc }) => [desc(att.date)],
  });

  const data = await query;
  
  return NextResponse.json({ attendance: data });
}, { roles: ['school_admin', 'teacher', 'parent'] });

// POST /api/attendance - Submit attendance
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const validation = attendanceSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.errors },
      { status: 400 }
    );
  }

  const { sectionId, date, records } = validation.data;
  const schoolId = user.schoolId!;
  const attendanceDate = new Date(date);

  // Check if attendance already submitted for this date
  const existing = await db.query.attendance.findFirst({
    where: and(
      eq(attendance.sectionId, sectionId),
      eq(attendance.date, attendanceDate)
    ),
  });

  if (existing) {
    return NextResponse.json(
      { error: 'Attendance already submitted for this date' },
      { status: 409 }
    );
  }

  // Prepare attendance records
  const attendanceRecords = records.map(record => ({
    schoolId,
    studentId: record.studentId,
    sectionId,
    date: attendanceDate,
    status: record.status,
    markedBy: user.id,
    notes: record.notes,
  }));

  // Insert attendance records
  await db.insert(attendance).values(attendanceRecords);

  // Calculate stats
  const stats = {
    present: records.filter(r => r.status === 'present').length,
    absent: records.filter(r => r.status === 'absent').length,
    late: records.filter(r => r.status === 'late').length,
  };

  // Audit log
  await logAttendanceSubmission(
    schoolId,
    user.id,
    sectionId,
    attendanceDate.toISOString().split('T')[0],
    stats
  );

  // Send notifications for absences and late arrivals (async)
  const absentStudents = records.filter(r => r.status === 'absent' || r.status === 'late');
  for (const record of absentStudents) {
    // In production, fetch parent IDs for the student and send notifications
    // This is a simplified version
    console.log(`Attendance alert needed for student ${record.studentId}`);
  }

  return NextResponse.json({
    success: true,
    stats,
    message: `Attendance submitted: ${stats.present} present, ${stats.absent} absent, ${stats.late} late`,
  });
}, { roles: ['teacher'] });
