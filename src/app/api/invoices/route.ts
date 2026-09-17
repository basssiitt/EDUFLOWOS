import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { db } from '@/lib/db';
import { invoices, students, feeStructures, studentConcessions, parentStudents } from '@/lib/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { generateInvoiceNumber } from '@/lib/utils';
import { sendInvoiceNotification } from '@/lib/services/notifications';

// GET /api/invoices - List invoices
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const schoolId = user.schoolId!;
  const status = searchParams.get('status');
  const month = searchParams.get('month');
  const year = searchParams.get('year');
  const studentId = searchParams.get('studentId');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = db.query.invoices.findMany({
    where: (inv, { eq, and }) => {
      const conditions = [eq(inv.schoolId, schoolId)];
      
      if (status) {
        conditions.push(eq(inv.status, status as any));
      }
      if (month) {
        conditions.push(eq(inv.month, parseInt(month)));
      }
      if (year) {
        conditions.push(eq(inv.year, parseInt(year)));
      }
      if (studentId) {
        conditions.push(eq(inv.studentId, studentId));
      }
      
      return and(...conditions);
    },
    with: {
      // student: true, // Would need proper relation
    },
    limit,
    offset: (page - 1) * limit,
    orderBy: (inv, { desc }) => [desc(inv.createdAt)],
  });

  const data = await query;
  
  return NextResponse.json({ invoices: data });
}, { roles: ['school_admin', 'parent'] });

// POST /api/invoices - Generate invoices
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const { month, year, sendNotifications = true } = body;
  const schoolId = user.schoolId!;

  if (!month || !year) {
    return NextResponse.json(
      { error: 'Month and year are required' },
      { status: 400 }
    );
  }

  // Get all active students
  const activeStudents = await db.query.students.findMany({
    where: and(
      eq(students.schoolId, schoolId),
      eq(students.isActive, true)
    ),
  });

  // Get fee structures for the school
  const fees = await db.query.feeStructures.findMany({
    where: eq(feeStructures.schoolId, schoolId),
  });

  // Get concessions
  const concessions = await db.query.studentConcessions.findMany({
    where: eq(studentConcessions.schoolId, schoolId),
  });

  const invoicesCreated = [];
  const errors = [];

  for (const student of activeStudents) {
    try {
      // Calculate total fees for the student
      let subtotal = 0;
      const lineItems = [];

      for (const fee of fees) {
        // Check if fee applies to student's class
        if (fee.classId && fee.classId !== student.sectionId) {
          // Would need to check class hierarchy
        }

        // Check for concessions
        const concession = concessions.find(c => 
          c.studentId === student.id && c.feeStructureId === fee.id
        );

        let amount = parseFloat(fee.amount);
        let discount = 0;

        if (concession) {
          if (concession.discountPercent) {
            discount = amount * (parseFloat(concession.discountPercent) / 100);
          } else if (concession.discountAmount) {
            discount = parseFloat(concession.discountAmount);
          }
        }

        const finalAmount = amount - discount;
        subtotal += finalAmount;

        lineItems.push({
          feeStructureId: fee.id,
          name: fee.name,
          amount,
          discount,
          finalAmount,
        });
      }

      // Calculate late fee if applicable
      const dueDate = new Date(year, month - 1, 10); // 10th of month
      const now = new Date();
      let lateFee = 0;

      if (now > dueDate) {
        const daysOverdue = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        const lateFeeConfig = fees.find(f => parseFloat(f.lateFeeAmount) > 0);
        
        if (lateFeeConfig && daysOverdue > lateFeeConfig.lateFeeDaysAfterDue) {
          lateFee = parseFloat(lateFeeConfig.lateFeeAmount);
        }
      }

      const totalAmount = subtotal + lateFee;

      // Check if invoice already exists
      const existingInvoice = await db.query.invoices.findFirst({
        where: and(
          eq(invoices.studentId, student.id),
          eq(invoices.month, month),
          eq(invoices.year, year)
        ),
      });

      if (existingInvoice) {
        errors.push(`Invoice already exists for student ${student.firstName} ${student.lastName}`);
        continue;
      }

      // Create invoice
      const invoiceNumber = generateInvoiceNumber(schoolId, month, year);

      const [newInvoice] = await db.insert(invoices).values({
        schoolId,
        studentId: student.id,
        invoiceNumber,
        month,
        year,
        subtotal: subtotal.toString(),
        discount: '0',
        lateFee: lateFee.toString(),
        totalAmount: totalAmount.toString(),
        status: 'pending',
        dueDate,
        lineItems,
      }).returning();

      invoicesCreated.push(newInvoice);

      // Send notification if enabled
      if (sendNotifications) {
        // Find parent for this student
        const parentLink = await db.query.parentStudents.findFirst({
          where: and(
            eq(parentStudents.studentId, student.id),
            eq(parentStudents.isPrimary, true)
          ),
        });

        if (parentLink) {
          sendInvoiceNotification(
            schoolId,
            parentLink.parentId,
            `${student.firstName} ${student.lastName}`,
            invoiceNumber,
            totalAmount,
            dueDate.toLocaleDateString()
          ).catch(console.error);
        }
      }
    } catch (error: any) {
      errors.push(`Error processing ${student.firstName}: ${error.message}`);
    }
  }

  return NextResponse.json({
    success: true,
    invoicesCreated: invoicesCreated.length,
    errors,
    message: `Generated ${invoicesCreated.length} invoices`,
  });
}, { roles: ['school_admin'] });
