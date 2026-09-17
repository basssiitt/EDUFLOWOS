'use client';

import React from 'react';
import { Bell, Search, Menu, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
  showSearch?: boolean;
  rightContent?: React.ReactNode;
}

export function Header({ title, subtitle, onMenuClick, showSearch = true, rightContent }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {onMenuClick && (
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-md hover:bg-muted"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {showSearch && (
          <div className="hidden md:flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="h-9 w-64 rounded-lg border border-input bg-background pl-8 pr-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>
        )}

        <button className="relative p-2 rounded-md hover:bg-muted">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {rightContent || (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">U</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">User Name</p>
              <p className="text-xs text-muted-foreground">Role</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>
    </header>
  );
}
