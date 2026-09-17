'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Calendar,
  Users,
  Download,
} from 'lucide-react';

interface AttendanceRecord {
  studentId: string;
  name: string;
  rollNumber: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string;
}

const mockStudents: AttendanceRecord[] = [
  { studentId: '1', name: 'Ahmed Khan', rollNumber: '001', status: 'present', notes: '' },
  { studentId: '2', name: 'Fatima Ahmed', rollNumber: '002', status: 'present', notes: '' },
  { studentId: '3', name: 'Hassan Ali', rollNumber: '003', status: 'absent', notes: 'Sick leave' },
  { studentId: '4', name: 'Ayesha Malik', rollNumber: '004', status: 'present', notes: '' },
  { studentId: '5', name: 'Omar Farooq', rollNumber: '005', status: 'late', notes: 'Traffic' },
  { studentId: '6', name: 'Zainab Hassan', rollNumber: '006', status: 'present', notes: '' },
  { studentId: '7', name: 'Bilal Ahmed', rollNumber: '007', status: 'present', notes: '' },
  { studentId: '8', name: 'Sara Khan', rollNumber: '008', status: 'excused', notes: 'Family event' },
  { studentId: '9', name: 'Usman Ali', rollNumber: '009', status: 'present', notes: '' },
  { studentId: '10', name: 'Maryam Shah', rollNumber: '010', status: 'present', notes: '' },
];

const classOptions = [
  { value: 'grade5a', label: 'Grade 5 - Section A' },
  { value: 'grade5b', label: 'Grade 5 - Section B' },
  { value: 'grade6a', label: 'Grade 6 - Section A' },
  { value: 'grade6b', label: 'Grade 6 - Section B' },
];

export default function AttendancePage() {
  const [selectedClass, setSelectedClass] = useState('grade5a');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockStudents);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateStatus = (studentId: string, status: AttendanceRecord['status']) => {
    setAttendance(prev =>
      prev.map(record =>
        record.studentId === studentId ? { ...record, status } : record
      )
    );
    setIsSubmitted(false);
  };

  const markAllPresent = () => {
    setAttendance(prev =>
      prev.map(record => ({ ...record, status: 'present' as const, notes: '' }))
    );
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
  };

  const getStatusIcon = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'present':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'absent':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-amber-500" />;
      case 'excused':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: AttendanceRecord['status']) => {
    const variants: Record<string, 'success' | 'destructive' | 'warning' | 'info'> = {
      present: 'success',
      absent: 'destructive',
      late: 'warning',
      excused: 'info',
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Attendance</h2>
          <p className="text-muted-foreground">
            Mark daily attendance for your assigned classes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Class and Date Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                label="Select Class"
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={markAllPresent}>
                Mark All Present
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.present}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Late</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.late}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Excused</CardTitle>
            <AlertCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Attendance Grid</CardTitle>
              <CardDescription>
                Click on status buttons to toggle attendance for each student
              </CardDescription>
            </div>
            {isSubmitted && (
              <Badge variant="success">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Submitted
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {attendance.map((record) => (
              <div
                key={record.studentId}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50"
              >
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(record.status)}
                  <div>
                    <p className="font-medium">{record.name}</p>
                    <p className="text-sm text-muted-foreground">Roll #{record.rollNumber}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                    <Button
                      key={status}
                      variant={record.status === status ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(record.studentId, status)}
                      className={
                        record.status === status
                          ? status === 'present'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : status === 'absent'
                            ? 'bg-red-600 hover:bg-red-700'
                            : status === 'late'
                            ? 'bg-amber-500 hover:bg-amber-600'
                            : 'bg-blue-600 hover:bg-blue-700'
                          : ''
                      }
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Submit Attendance
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">Attendance Submission</p>
              <p className="text-sm text-blue-700 mt-1">
                Once submitted, attendance cannot be modified. Parents will be notified immediately for absences and late arrivals.
                Make sure to double-check before submitting.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
