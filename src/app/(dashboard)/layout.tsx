'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In a real app, you'd get this from session/auth
  const userRole = 'school_admin';
  const schoolSlug = 'demo-school';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed z-50 lg:static lg:z-0 transition-transform duration-300",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <Sidebar
          role={userRole}
          schoolSlug={schoolSlug}
          isCollapsed={sidebarCollapsed}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Dashboard"
          onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
