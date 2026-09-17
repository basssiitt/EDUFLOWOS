'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Plus,
  Save,
  Download,
  Upload,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Award,
} from 'lucide-react';

interface StudentGrade {
  studentId: string;
  name: string;
  rollNumber: string;
  quiz1: number | null;
  assignment1: number | null;
  midterm: number | null;
  final: number | null;
  total: number;
  percentage: number;
  grade: string;
  gpa: number;
}

const mockStudents: StudentGrade[] = [
  { studentId: '1', name: 'Ahmed Khan', rollNumber: '001', quiz1: 18, assignment1: 45, midterm: 85, final: 92, total: 240, percentage: 80, grade: 'A-', gpa: 3.3 },
  { studentId: '2', name: 'Fatima Ahmed', rollNumber: '002', quiz1: 20, assignment1: 48, midterm: 92, final: 95, total: 255, percentage: 85, grade: 'A', gpa: 3.7 },
  { studentId: '3', name: 'Hassan Ali', rollNumber: '003', quiz1: 15, assignment1: 38, midterm: 72, final: 78, total: 203, percentage: 68, grade: 'B-', gpa: 2.3 },
  { studentId: '4', name: 'Ayesha Malik', rollNumber: '004', quiz1: 19, assignment1: 47, midterm: 88, final: 90, total: 244, percentage: 81, grade: 'A-', gpa: 3.3 },
  { studentId: '5', name: 'Omar Farooq', rollNumber: '005', quiz1: 12, assignment1: 35, midterm: 65, final: 70, total: 182, percentage: 61, grade: 'C+', gpa: 2.0 },
  { studentId: '6', name: 'Zainab Hassan', rollNumber: '006', quiz1: 17, assignment1: 42, midterm: 80, final: 85, total: 224, percentage: 75, grade: 'B+', gpa: 3.0 },
  { studentId: '7', name: 'Bilal Ahmed', rollNumber: '007', quiz1: 16, assignment1: 40, midterm: 75, final: 82, total: 213, percentage: 71, grade: 'B-', gpa: 2.7 },
  { studentId: '8', name: 'Sara Khan', rollNumber: '008', quiz1: 20, assignment1: 50, midterm: 95, final: 98, total: 263, percentage: 88, grade: 'A+', gpa: 4.0 },
  { studentId: '9', name: 'Usman Ali', rollNumber: '009', quiz1: 14, assignment1: 36, midterm: 68, final: 72, total: 190, percentage: 63, grade: 'C+', gpa: 2.0 },
  { studentId: '10', name: 'Maryam Shah', rollNumber: '010', quiz1: 18, assignment1: 44, midterm: 82, final: 88, total: 232, percentage: 77, grade: 'B+', gpa: 3.0 },
];

const examOptions = [
  { value: 'quiz1', label: 'Quiz 1 (20 marks)' },
  { value: 'assignment1', label: 'Assignment 1 (50 marks)' },
  { value: 'midterm', label: 'Midterm (100 marks)' },
  { value: 'final', label: 'Final (100 marks)' },
];

const classOptions = [
  { value: 'grade5a_math', label: 'Grade 5-A Mathematics' },
  { value: 'grade5b_math', label: 'Grade 5-B Mathematics' },
  { value: 'grade6a_math', label: 'Grade 6-A Mathematics' },
];

export default function GradebookPage() {
  const [selectedClass, setSelectedClass] = useState('grade5a_math');
  const [selectedExam, setSelectedExam] = useState('quiz1');
  const [grades, setGrades] = useState<StudentGrade[]>(mockStudents);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const updateGrade = (studentId: string, field: keyof StudentGrade, value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setGrades(prev =>
      prev.map(student => {
        if (student.studentId !== studentId) return student;
        
        const updated = { ...student, [field]: numValue };
        
        // Recalculate totals
        const quiz1 = updated.quiz1 || 0;
        const assignment1 = updated.assignment1 || 0;
        const midterm = updated.midterm || 0;
        const final = updated.final || 0;
        
        updated.total = quiz1 + assignment1 + midterm + final;
        updated.percentage = Math.round((updated.total / 270) * 100); // 20 + 50 + 100 + 100 = 270
        
        // Calculate grade and GPA
        if (updated.percentage >= 90) { updated.grade = 'A+'; updated.gpa = 4.0; }
        else if (updated.percentage >= 85) { updated.grade = 'A'; updated.gpa = 3.7; }
        else if (updated.percentage >= 80) { updated.grade = 'A-'; updated.gpa = 3.3; }
        else if (updated.percentage >= 75) { updated.grade = 'B+'; updated.gpa = 3.0; }
        else if (updated.percentage >= 70) { updated.grade = 'B'; updated.gpa = 2.7; }
        else if (updated.percentage >= 65) { updated.grade = 'B-'; updated.gpa = 2.3; }
        else if (updated.percentage >= 60) { updated.grade = 'C+'; updated.gpa = 2.0; }
        else if (updated.percentage >= 55) { updated.grade = 'C'; updated.gpa = 1.7; }
        else if (updated.percentage >= 50) { updated.grade = 'C-'; updated.gpa = 1.3; }
        else if (updated.percentage >= 45) { updated.grade = 'D+'; updated.gpa = 1.0; }
        else if (updated.percentage >= 40) { updated.grade = 'D'; updated.gpa = 0.7; }
        else { updated.grade = 'F'; updated.gpa = 0.0; }
        
        return updated;
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };

  const stats = {
    average: Math.round(grades.reduce((sum, s) => sum + s.percentage, 0) / grades.length),
    highest: Math.max(...grades.map(s => s.percentage)),
    lowest: Math.min(...grades.map(s => s.percentage)),
    passRate: Math.round((grades.filter(s => s.percentage >= 40).length / grades.length) * 100),
  };

  const getGradeColor = (percentage: number) => {
    if (percentage >= 80) return 'text-emerald-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gradebook</h2>
          <p className="text-muted-foreground">
            Manage student grades and assessments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {!isEditing ? (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Enter Grades
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Grades
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Class Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Select
                label="Class & Subject"
                options={classOptions}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <Select
                label="Assessment"
                options={examOptions}
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Class Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getGradeColor(stats.average)}`}>
              {stats.average}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.highest}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lowest</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.lowest}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
            <Award className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.passRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card>
        <CardHeader>
          <CardTitle>Student Grades</CardTitle>
          <CardDescription>
            {isEditing ? 'Click on cells to edit grades' : 'View student performance'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Roll #</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead className="text-center">Quiz 1<br/>(20)</TableHead>
                <TableHead className="text-center">Assignment 1<br/>(50)</TableHead>
                <TableHead className="text-center">Midterm<br/>(100)</TableHead>
                <TableHead className="text-center">Final<br/>(100)</TableHead>
                <TableHead className="text-center">Total<br/>(270)</TableHead>
                <TableHead className="text-center">%</TableHead>
                <TableHead className="text-center">Grade</TableHead>
                <TableHead className="text-center">GPA</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-mono">{student.rollNumber}</TableCell>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell className="text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={student.quiz1?.toString() || ''}
                        onChange={(e) => updateGrade(student.studentId, 'quiz1', e.target.value)}
                        className="w-16 text-center mx-auto"
                      />
                    ) : (
                      student.quiz1 ?? '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={student.assignment1?.toString() || ''}
                        onChange={(e) => updateGrade(student.studentId, 'assignment1', e.target.value)}
                        className="w-16 text-center mx-auto"
                      />
                    ) : (
                      student.assignment1 ?? '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={student.midterm?.toString() || ''}
                        onChange={(e) => updateGrade(student.studentId, 'midterm', e.target.value)}
                        className="w-20 text-center mx-auto"
                      />
                    ) : (
                      student.midterm ?? '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    {isEditing ? (
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={student.final?.toString() || ''}
                        onChange={(e) => updateGrade(student.studentId, 'final', e.target.value)}
                        className="w-20 text-center mx-auto"
                      />
                    ) : (
                      student.final ?? '-'
                    )}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {student.total}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={getGradeColor(student.percentage)}>
                      {student.percentage}%
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={student.percentage >= 60 ? 'success' : student.percentage >= 40 ? 'warning' : 'destructive'}>
                      {student.grade}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center font-mono">
                    {student.gpa.toFixed(1)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grade Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'A (80-100%)', count: grades.filter(s => s.percentage >= 80).length, color: 'bg-emerald-500' },
              { label: 'B (60-79%)', count: grades.filter(s => s.percentage >= 60 && s.percentage < 80).length, color: 'bg-blue-500' },
              { label: 'C (40-59%)', count: grades.filter(s => s.percentage >= 40 && s.percentage < 60).length, color: 'bg-amber-500' },
              { label: 'F (Below 40%)', count: grades.filter(s => s.percentage < 40).length, color: 'bg-red-500' },
            ].map((group) => (
              <div key={group.label} className="flex items-center gap-3">
                <div className={`h-12 w-12 rounded-lg ${group.color} flex items-center justify-center text-white font-bold`}>
                  {group.count}
                </div>
                <div>
                  <p className="font-medium">{group.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {Math.round((group.count / grades.length) * 100)}% of class
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
