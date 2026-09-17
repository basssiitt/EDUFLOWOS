import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { expenseSchema } from '@/lib/validators';
import { logExpenseAddition } from '@/lib/services/audit';

// GET /api/expenses - List expenses
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const schoolId = user.schoolId!;
  const category = searchParams.get('category');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '50');

  let query = db.query.expenses.findMany({
    where: (exp, { eq, and, gte, lte }) => {
      const conditions = [eq(exp.schoolId, schoolId)];
      
      if (category) {
        conditions.push(eq(exp.category, category));
      }
      if (startDate) {
        conditions.push(gte(exp.expenseDate, new Date(startDate)));
      }
      if (endDate) {
        conditions.push(lte(exp.expenseDate, new Date(endDate)));
      }
      
      return and(...conditions);
    },
    limit,
    offset: (page - 1) * limit,
    orderBy: (exp, { desc }) => [desc(exp.expenseDate)],
  });

  const data = await query;
  
  return NextResponse.json({ expenses: data });
}, { roles: ['school_admin'] });

// POST /api/expenses - Create expense
export const POST = withAuth(async (req, user) => {
  const body = await req.json();
  const validation = expenseSchema.safeParse(body);
  
  if (!validation.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: validation.error.errors },
      { status: 400 }
    );
  }

  const data = validation.data;
  const schoolId = user.schoolId!;

  // Create expense
  const [newExpense] = await db.insert(expenses).values({
    schoolId,
    category: data.category,
    description: data.description,
    amount: data.amount.toString(),
    expenseDate: new Date(data.expenseDate),
    createdBy: user.id,
  }).returning();

  // Audit log
  await logExpenseAddition(schoolId, user.id, newExpense.id, data.amount, data.category);

  return NextResponse.json({ expense: newExpense }, { status: 201 });
}, { roles: ['school_admin'] });
