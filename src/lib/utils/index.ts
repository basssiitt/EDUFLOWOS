import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'PKR'): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string, format: 'short' | 'long' | 'time' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' });
    case 'long':
      return d.toLocaleDateString('en-PK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    case 'time':
      return d.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    default:
      return d.toLocaleDateString();
  }
}

export function generateInvoiceNumber(schoolId: string, month: number, year: number): string {
  const prefix = schoolId.substring(0, 4).toUpperCase();
  const monthStr = month.toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INV-${prefix}-${year}${monthStr}-${random}`;
}

export function generateTemporaryPassword(length: number = 12): string {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  let password = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length];
  }
  return password;
}

export function calculateGrade(percentage: number): { grade: string; gpa: number } {
  if (percentage >= 90) return { grade: 'A+', gpa: 4.0 };
  if (percentage >= 85) return { grade: 'A', gpa: 3.7 };
  if (percentage >= 80) return { grade: 'A-', gpa: 3.3 };
  if (percentage >= 75) return { grade: 'B+', gpa: 3.0 };
  if (percentage >= 70) return { grade: 'B', gpa: 2.7 };
  if (percentage >= 65) return { grade: 'B-', gpa: 2.3 };
  if (percentage >= 60) return { grade: 'C+', gpa: 2.0 };
  if (percentage >= 55) return { grade: 'C', gpa: 1.7 };
  if (percentage >= 50) return { grade: 'C-', gpa: 1.3 };
  if (percentage >= 45) return { grade: 'D+', gpa: 1.0 };
  if (percentage >= 40) return { grade: 'D', gpa: 0.7 };
  return { grade: 'F', gpa: 0.0 };
}

export function calculatePercentile(value: number, allValues: number[]): number {
  const sorted = [...allValues].sort((a, b) => a - b);
  const index = sorted.filter(v => v < value).length;
  return Math.round((index / sorted.length) * 100);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[month - 1] || '';
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

export function addBusinessDays(startDate: Date, days: number): Date {
  let date = new Date(startDate);
  let added = 0;
  while (added < days) {
    date.setDate(date.getDate() + 1);
    if (!isWeekend(date)) {
      added++;
    }
  }
  return date;
}
