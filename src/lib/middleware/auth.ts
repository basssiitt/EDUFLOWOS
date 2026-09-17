import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { users, schools } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'parent';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  schoolId: string | null;
}

export async function getAuthUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    role: session.user.role as UserRole,
    schoolId: session.user.schoolId,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getAuthUser();
  
  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
}

export async function requireRole(...roles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  
  if (!roles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

export async function requireSchoolAccess(schoolId: string): Promise<AuthUser> {
  const user = await requireAuth();

  // Super admin has access to all schools
  if (user.role === 'super_admin') {
    return user;
  }

  // Other users must belong to the school
  if (user.schoolId !== schoolId) {
    throw new Error('Access denied to this school');
  }

  return user;
}

export function isSuperAdmin(email: string): boolean {
  return email === process.env.SUPER_ADMIN_EMAIL || email === 'basithunyawrr@gmail.com';
}

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    with: {
      school: true,
    },
  });

  return user;
}

export async function getUserSchool(userId: string) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      schoolId: true,
    },
  });

  if (!user?.schoolId) return null;

  return db.query.schools.findFirst({
    where: eq(schools.id, user.schoolId),
  });
}

// API route handler wrapper with auth
export function withAuth(
  handler: (req: NextRequest, user: AuthUser, context?: any) => Promise<NextResponse>,
  options?: {
    roles?: UserRole[];
    requireSchool?: boolean;
  }
) {
  return async (req: NextRequest, context?: any) => {
    try {
      let user: AuthUser;

      if (options?.roles) {
        user = await requireRole(...options.roles);
      } else {
        user = await requireAuth();
      }

      return await handler(req, user, context);
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      if (error.message === 'Insufficient permissions') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (error.message.includes('Access denied')) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  };
}
