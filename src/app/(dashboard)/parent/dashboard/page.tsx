import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  FileText,
  Receipt,
  MessageSquare,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

// Mock data
const childData = {
  name: 'Ahmed Khan',
  class: 'Grade 5 - Section A',
  rollNumber: '001',
  attendance: {
    thisMonth: { present: 18, absent: 1, late: 1 },
    percentage: 94,
  },
  recentGrades: [
    { subject: 'Mathematics', grade: 'A', score: 92 },
    { subject: 'Science', grade: 'A-', score: 85 },
    { subject: 'English', grade: 'B+', score: 78 },
    { subject: 'Urdu', grade: 'B', score: 72 },
  ],
  pendingFees: {
    amount: 15000,
    dueDate: '2024-10-10',
    invoiceNumber: 'INV-DEMO-202410-0001',
  },
  recentDiary: [
    { subject: 'Mathematics', title: 'Chapter 5 Homework', date: 'Today' },
    { subject: 'English', title: 'Essay Writing', date: 'Today' },
    { subject: 'Science', title: 'Lab Report', date: 'Yesterday' },
  ],
};

export default function ParentDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Parent Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's {childData.name}'s academic overview.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </Button>
          <Button size="sm">
            <MessageSquare className="mr-2 h-4 w-4" />
            AI Counselor
          </Button>
        </div>
      </div>

      {/* Child Info Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">{childData.name}</h3>
              <p className="text-muted-foreground">
                {childData.class} • Roll #{childData.rollNumber}
              </p>
            </div>
            <Badge variant="success" className="ml-auto">Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {childData.attendance.percentage}%
            </div>
            <p className="text-xs text-muted-foreground">
              {childData.attendance.thisMonth.present} present, {childData.attendance.thisMonth.absent} absent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">B+</div>
            <p className="text-xs text-muted-foreground">
              Good performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <Receipt className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR 15K</div>
            <p className="text-xs text-muted-foreground">
              Due: Oct 10, 2024
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Homework</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Active assignments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Attendance Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Attendance This Month</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium">Present</p>
                    <p className="text-sm text-muted-foreground">{childData.attendance.thisMonth.present} days</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-emerald-600">
                  {childData.attendance.thisMonth.present}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">Absent</p>
                    <p className="text-sm text-muted-foreground">{childData.attendance.thisMonth.absent} day</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">
                  {childData.attendance.thisMonth.absent}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium">Late</p>
                    <p className="text-sm text-muted-foreground">{childData.attendance.thisMonth.late} day</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-amber-600">
                  {childData.attendance.thisMonth.late}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Grades */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Grades</CardTitle>
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {childData.recentGrades.map((grade) => (
                <div key={grade.subject} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{grade.subject}</p>
                      <p className="text-sm text-muted-foreground">Score: {grade.score}%</p>
                    </div>
                  </div>
                  <Badge variant={grade.score >= 80 ? 'success' : grade.score >= 60 ? 'warning' : 'destructive'}>
                    {grade.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Diary Entries */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Homework/Diary</CardTitle>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {childData.recentDiary.map((entry, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{entry.title}</p>
                  <p className="text-sm text-muted-foreground">{entry.subject}</p>
                </div>
                <span className="text-sm text-muted-foreground">{entry.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fee Payment CTA */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-amber-900">Fee Payment Pending</h3>
              <p className="text-sm text-amber-700">
                Invoice {childData.pendingFees.invoiceNumber} - PKR {childData.pendingFees.amount.toLocaleString()} due on {childData.pendingFees.dueDate}
              </p>
            </div>
            <Button>
              <Receipt className="mr-2 h-4 w-4" />
              Pay Now
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Counselor CTA */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Academic Counselor</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized insights and study recommendations for {childData.name}
                </p>
              </div>
            </div>
            <Button variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Chat Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
