import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  GraduationCap,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// Mock data - in production, this would come from the database
const stats = {
  totalStudents: 1247,
  totalTeachers: 45,
  attendanceRate: 94.2,
  revenueThisMonth: 2850000,
  expensesThisMonth: 1850000,
  netProfit: 1000000,
  pendingFees: 450000,
  overdueInvoices: 23,
};

const recentActivity = [
  { id: 1, type: 'attendance', message: 'Attendance submitted for Grade 5-A', time: '2 min ago', status: 'success' },
  { id: 2, type: 'fee', message: 'Fee payment received from Ahmed Khan', time: '15 min ago', status: 'success' },
  { id: 3, type: 'diary', message: 'New homework posted for Grade 3-B', time: '1 hour ago', status: 'info' },
  { id: 4, type: 'alert', message: '3 students absent in Grade 8-A', time: '2 hours ago', status: 'warning' },
  { id: 5, type: 'exam', message: 'Midterm results published for Grade 10', time: '3 hours ago', status: 'info' },
];

const upcomingEvents = [
  { id: 1, title: 'Parent-Teacher Meeting', date: 'Sep 20, 2024', type: 'meeting' },
  { id: 2, title: 'Midterm Exams Begin', date: 'Sep 25, 2024', type: 'exam' },
  { id: 3, title: 'Fee Due Date', date: 'Oct 1, 2024', type: 'fee' },
  { id: 4, title: 'Sports Day', date: 'Oct 5, 2024', type: 'event' },
];

export default function SchoolDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at your school today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Academic Year 2024-2025
          </Button>
          <Button size="sm">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                +12% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                +2.1% from last week
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(stats.revenueThisMonth / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 flex items-center">
                <TrendingUp className="mr-1 h-3 w-3" />
                +8% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(stats.netProfit / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +15% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates from your school</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`mt-1 h-2 w-2 rounded-full ${
                    activity.status === 'success' ? 'bg-emerald-500' :
                    activity.status === 'warning' ? 'bg-amber-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.message}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Important dates and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                    event.type === 'exam' ? 'bg-purple-100 text-purple-600' :
                    event.type === 'fee' ? 'bg-amber-100 text-amber-600' :
                    'bg-emerald-100 text-emerald-600'
                  }`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(stats.pendingFees / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueInvoices} overdue invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTeachers}</div>
            <p className="text-xs text-muted-foreground">
              Active teaching staff
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expenses (This Month)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(stats.expensesThisMonth / 100000).toFixed(1)}L</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <TrendingDown className="mr-1 h-3 w-3" />
                -5% from last month
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-amber-900">Attention Required</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-amber-800">
              • {stats.overdueInvoices} fee invoices are overdue. Send reminders to parents.
            </p>
            <p className="text-sm text-amber-800">
              • 5 teachers have not submitted today's attendance yet.
            </p>
            <p className="text-sm text-amber-800">
              • Midterm exam results need to be published by Sep 30.
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              Send Fee Reminders
            </Button>
            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
              View Attendance Status
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
