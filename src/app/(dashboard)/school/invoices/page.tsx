'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Receipt,
  Download,
  Send,
  Plus,
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  Mail,
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  studentName: string;
  className: string;
  month: string;
  year: number;
  totalAmount: number;
  paidAmount: number;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  dueDate: string;
  paidAt?: string;
}

const mockInvoices: Invoice[] = [
  { id: '1', invoiceNumber: 'INV-DEMO-202409-0001', studentName: 'Ahmed Khan', className: 'Grade 5-A', month: 'September', year: 2024, totalAmount: 15000, paidAmount: 15000, status: 'paid', dueDate: '2024-09-10', paidAt: '2024-09-08' },
  { id: '2', invoiceNumber: 'INV-DEMO-202409-0002', studentName: 'Fatima Ahmed', className: 'Grade 5-A', month: 'September', year: 2024, totalAmount: 15000, paidAmount: 0, status: 'overdue', dueDate: '2024-09-10' },
  { id: '3', invoiceNumber: 'INV-DEMO-202409-0003', studentName: 'Hassan Ali', className: 'Grade 5-B', month: 'September', year: 2024, totalAmount: 12000, paidAmount: 12000, status: 'paid', dueDate: '2024-09-10', paidAt: '2024-09-12' },
  { id: '4', invoiceNumber: 'INV-DEMO-202409-0004', studentName: 'Ayesha Malik', className: 'Grade 6-A', month: 'September', year: 2024, totalAmount: 18000, paidAmount: 10000, status: 'partial', dueDate: '2024-09-10' },
  { id: '5', invoiceNumber: 'INV-DEMO-202409-0005', studentName: 'Omar Farooq', className: 'Grade 6-A', month: 'September', year: 2024, totalAmount: 18000, paidAmount: 0, status: 'pending', dueDate: '2024-10-10' },
];

const monthOptions = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function InvoicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: mockInvoices.length,
    paid: mockInvoices.filter(i => i.status === 'paid').length,
    pending: mockInvoices.filter(i => i.status === 'pending').length,
    overdue: mockInvoices.filter(i => i.status === 'overdue').length,
    totalAmount: mockInvoices.reduce((sum, i) => sum + i.totalAmount, 0),
    collectedAmount: mockInvoices.reduce((sum, i) => sum + i.paidAmount, 0),
  };

  const handleGenerateInvoices = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    setShowGenerateDialog(false);
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const variants: Record<string, 'success' | 'warning' | 'destructive' | 'info'> = {
      paid: 'success',
      pending: 'info',
      overdue: 'destructive',
      partial: 'warning',
    };
    return <Badge variant={variants[status]}>{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fee Management</h2>
          <p className="text-muted-foreground">
            Generate, manage, and track student fee invoices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowGenerateDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Invoices
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              PKR {(stats.collectedAmount / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by student name or invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
                { value: 'overdue', label: 'Overdue' },
                { value: 'partial', label: 'Partial' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>
            {filteredInvoices.length} invoices found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-mono text-sm">
                    {invoice.invoiceNumber}
                  </TableCell>
                  <TableCell className="font-medium">{invoice.studentName}</TableCell>
                  <TableCell>{invoice.className}</TableCell>
                  <TableCell>{invoice.month} {invoice.year}</TableCell>
                  <TableCell className="text-right font-medium">
                    PKR {invoice.totalAmount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    PKR {invoice.paidAmount.toLocaleString()}
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                  <TableCell>
                    <span className={invoice.status === 'overdue' ? 'text-red-600' : ''}>
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate Invoices Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Monthly Invoices</DialogTitle>
            <DialogDescription>
              Create fee vouchers for all students for a specific month
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              label="Month"
              options={monthOptions}
              placeholder="Select month"
            />

            <Input
              label="Year"
              type="number"
              defaultValue="2024"
              min="2024"
              max="2100"
            />

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">Generation Summary</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 1,247 students will receive invoices</li>
                <li>• Based on current fee structures</li>
                <li>• Late fees will apply after due date</li>
                <li>• Concessions/scholarships will be auto-applied</li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <input type="checkbox" id="sendNotifications" className="rounded" />
              <label htmlFor="sendNotifications" className="text-sm">
                Send notifications to parents via WhatsApp and email
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGenerateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleGenerateInvoices} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Generate Invoices
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
