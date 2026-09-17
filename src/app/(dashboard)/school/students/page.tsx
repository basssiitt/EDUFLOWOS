'use client';

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Upload,
  Search,
  Filter,
  Download,
  Plus,
  FileText,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  UserPlus,
  GraduationCap,
} from 'lucide-react';

// Mock student data
const mockStudents = [
  { id: '1', name: 'Ahmed Khan', class: 'Grade 5', section: 'A', rollNumber: '001', gender: 'Male', guardian: 'Ali Khan', status: 'active' },
  { id: '2', name: 'Fatima Ahmed', class: 'Grade 5', section: 'A', rollNumber: '002', gender: 'Female', guardian: 'Usman Ahmed', status: 'active' },
  { id: '3', name: 'Hassan Ali', class: 'Grade 5', section: 'B', rollNumber: '001', gender: 'Male', guardian: 'Ali Raza', status: 'active' },
  { id: '4', name: 'Ayesha Malik', class: 'Grade 6', section: 'A', rollNumber: '001', gender: 'Female', guardian: 'Tariq Malik', status: 'inactive' },
  { id: '5', name: 'Omar Farooq', class: 'Grade 6', section: 'A', rollNumber: '002', gender: 'Male', guardian: 'Farooq Shah', status: 'active' },
];

interface CsvValidationResult {
  valid: boolean;
  data: any[];
  errors: Array<{ row: number; field: string; message: string }>;
  warnings: Array<{ row: number; message: string }>;
}

export default function StudentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredStudents = mockStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCsvFile(file);
    }
  };

  const parseCsvFile = async (file: File) => {
    const text = await file.text();
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    const rows = [];
    for (let i = 1; i < Math.min(lines.length, 6); i++) { // Preview first 5 rows
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }
    
    setCsvPreview(rows);
    setImportStep('preview');
    
    // Simulate validation
    simulateValidation(rows, lines.length - 1);
  };

  const simulateValidation = (rows: any[], totalRows: number) => {
    // In production, this would call the API
    const errors: CsvValidationResult['errors'] = [];
    const warnings: CsvValidationResult['warnings'] = [];
    
    rows.forEach((row, index) => {
      if (!row['First Name']) {
        errors.push({ row: index + 2, field: 'First Name', message: 'First name is required' });
      }
      if (!row['Guardian Email']?.includes('@')) {
        errors.push({ row: index + 2, field: 'Guardian Email', message: 'Invalid email format' });
      }
      if (row['Gender'] && !['Male', 'Female', 'Other'].includes(row['Gender'])) {
        errors.push({ row: index + 2, field: 'Gender', message: 'Must be Male, Female, or Other' });
      }
    });

    setValidationResult({
      valid: errors.length === 0,
      data: rows,
      errors,
      warnings,
    });
  };

  const handleImport = async () => {
    setIsImporting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setImportResult({
      success: true,
      studentsCreated: 45,
      parentsCreated: 38,
      credentials: [
        { studentName: 'Ahmed Khan', guardianName: 'Ali Khan', guardianEmail: 'ali@email.com', temporaryPassword: 'Temp@12345' },
        { studentName: 'Fatima Ahmed', guardianName: 'Usman Ahmed', guardianEmail: 'usman@email.com', temporaryPassword: 'Temp@67890' },
      ],
    });
    
    setImportStep('result');
    setIsImporting(false);
  };

  const resetImport = () => {
    setImportStep('upload');
    setCsvFile(null);
    setCsvPreview([]);
    setValidationResult(null);
    setImportResult(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student records, enrollment, and bulk imports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImportDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Button>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,189</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">58</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search students by name, class, or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Roll #</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Guardian</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.name}</TableCell>
                  <TableCell>{student.class}</TableCell>
                  <TableCell>{student.section}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>{student.gender}</TableCell>
                  <TableCell>{student.guardian}</TableCell>
                  <TableCell>
                    <Badge variant={student.status === 'active' ? 'success' : 'secondary'}>
                      {student.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* CSV Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Students from CSV</DialogTitle>
            <DialogDescription>
              Upload a CSV file with student and guardian information
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Upload */}
          {importStep === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
              </div>
              
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
                <p className="text-sm text-muted-foreground">
                  Required columns: First Name, Last Name, Gender, DOB, Grade/Class, Section, Roll Number, Guardian Name, Guardian Email, Guardian Phone
                </p>
                <Button variant="link" size="sm" className="mt-2 p-0">
                  Download Template
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {importStep === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{csvFile?.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {csvPreview.length} rows preview (showing first 5)
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={resetImport}>
                  Change File
                </Button>
              </div>

              {/* Validation Results */}
              {validationResult && (
                <div className={`p-4 rounded-lg ${
                  validationResult.valid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
                } border`}>
                  <div className="flex items-center gap-2 mb-2">
                    {validationResult.valid ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    <span className="font-medium">
                      {validationResult.valid ? 'Validation Passed' : 'Validation Failed'}
                    </span>
                  </div>
                  
                  {validationResult.errors.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validationResult.errors.map((error, i) => (
                        <p key={i} className="text-sm text-red-600">
                          Row {error.row}: {error.field} - {error.message}
                        </p>
                      ))}
                    </div>
                  )}
                  
                  {validationResult.warnings.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {validationResult.warnings.map((warning, i) => (
                        <p key={i} className="text-sm text-amber-600">
                          Row {warning.row}: {warning.message}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Preview Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>First Name</TableHead>
                    <TableHead>Last Name</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>DOB</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead>Roll #</TableHead>
                    <TableHead>Guardian</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvPreview.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row['First Name']}</TableCell>
                      <TableCell>{row['Last Name']}</TableCell>
                      <TableCell>{row['Gender']}</TableCell>
                      <TableCell>{row['DOB']}</TableCell>
                      <TableCell>{row['Grade/Class']}</TableCell>
                      <TableCell>{row['Section']}</TableCell>
                      <TableCell>{row['Roll Number']}</TableCell>
                      <TableCell>{row['Guardian Name']}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <DialogFooter>
                <Button variant="outline" onClick={resetImport}>Cancel</Button>
                <Button
                  onClick={handleImport}
                  disabled={!validationResult?.valid || isImporting}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Import Students
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 3: Result */}
          {importStep === 'result' && importResult && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border-emerald-200 border p-6 rounded-lg text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600 mb-4" />
                <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                  Import Successful!
                </h3>
                <p className="text-emerald-700">
                  {importResult.studentsCreated} students and {importResult.parentsCreated} parent accounts created
                </p>
              </div>

              {/* Credentials Table */}
              <div>
                <h4 className="font-medium mb-2">Generated Credentials:</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Share these temporary credentials with parents. They should change their password on first login.
                </p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Temp Password</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importResult.credentials.map((cred: any, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{cred.studentName}</TableCell>
                        <TableCell>{cred.guardianName}</TableCell>
                        <TableCell>{cred.guardianEmail}</TableCell>
                        <TableCell className="font-mono text-sm">{cred.temporaryPassword}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Credentials
                </Button>
                <Button onClick={() => {
                  resetImport();
                  setShowImportDialog(false);
                }}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
