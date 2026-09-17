'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  FileText,
  Receipt,
  DollarSign,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  Calendar,
  School,
  UserCircle,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  role: 'super_admin' | 'school_admin' | 'teacher' | 'parent';
  schoolSlug?: string;
  isCollapsed?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: number;
}

const roleNavItems: Record<string, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Schools', href: '/admin/schools', icon: School },
    { label: 'Subscriptions', href: '/admin/subscriptions', icon: Receipt },
    { label: 'Feature Flags', href: '/admin/features', icon: FileText },
    { label: 'Usage Metrics', href: '/admin/metrics', icon: BarChart3 },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ],
  school_admin: [
    { label: 'Dashboard', href: '/school/dashboard', icon: LayoutDashboard },
    { label: 'Students', href: '/school/students', icon: GraduationCap },
    { label: 'Staff', href: '/school/staff', icon: Users },
    { label: 'Classes', href: '/school/classes', icon: BookOpen },
    { label: 'Attendance', href: '/school/attendance', icon: ClipboardCheck },
    { label: 'Exams & Grades', href: '/school/grades', icon: FileText },
    { label: 'Fee Management', href: '/school/invoices', icon: Receipt },
    { label: 'Expenses', href: '/school/expenses', icon: DollarSign },
    { label: 'P&L Reports', href: '/school/reports', icon: BarChart3 },
    { label: 'Notifications', href: '/school/notifications', icon: Bell },
    { label: 'Settings', href: '/school/settings', icon: Settings },
  ],
  teacher: [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Classes', href: '/teacher/classes', icon: BookOpen },
    { label: 'Attendance', href: '/teacher/attendance', icon: ClipboardCheck },
    { label: 'Diary', href: '/teacher/diary', icon: Calendar },
    { label: 'Gradebook', href: '/teacher/grades', icon: FileText },
    { label: 'Notifications', href: '/teacher/notifications', icon: Bell },
  ],
  parent: [
    { label: 'Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', href: '/parent/attendance', icon: ClipboardCheck },
    { label: 'Diary', href: '/parent/diary', icon: Calendar },
    { label: 'Grades', href: '/parent/grades', icon: FileText },
    { label: 'Fee Vouchers', href: '/parent/invoices', icon: Receipt },
    { label: 'AI Counselor', href: '/parent/ai-counselor', icon: MessageSquare },
    { label: 'Notifications', href: '/parent/notifications', icon: Bell },
  ],
};

export function Sidebar({ role, schoolSlug, isCollapsed = false }: SidebarProps) {
  const pathname = usePathname();
  const items = roleNavItems[role] || [];

  const getHref = (href: string) => {
    if (schoolSlug && role !== 'super_admin') {
      return `/portal/${schoolSlug}${href}`;
    }
    return href;
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-primary" />
          {!isCollapsed && (
            <span className="text-xl font-bold text-foreground">EduFlow</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <ul className="space-y-1">
          {items.map((item) => {
            const href = getHref(item.href);
            const isActive = pathname === href || pathname.startsWith(href + '/');
            
            return (
              <li key={item.href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary-foreground")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className={cn(
                          "inline-flex items-center justify-center h-5 w-5 rounded-full text-xs font-medium",
                          isActive
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary text-primary-foreground"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <Link
          href={getHref('/settings')}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          )}
        >
          <UserCircle className="h-5 w-5" />
          {!isCollapsed && <span>Profile</span>}
        </Link>
        <button
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors w-full"
          )}
          onClick={() => {
            // Handle logout
          }}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
