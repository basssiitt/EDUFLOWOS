'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Plus,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Filter,
  Receipt,
  Building2,
  Zap,
  Package,
  Users,
  Wrench,
  Megaphone,
  MoreHorizontal,
} from 'lucide-react';

interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  createdBy: string;
}

const mockExpenses: Expense[] = [
  { id: '1', category: 'payroll', description: 'Staff Salaries - September', amount: 1200000, date: '2024-09-01', createdBy: 'Admin' },
  { id: '2', category: 'rent', description: 'Building Rent - September', amount: 250000, date: '2024-09-01', createdBy: 'Admin' },
  { id: '3', category: 'utilities', description: 'Electricity Bill - August', amount: 85000, date: '2024-09-05', createdBy: 'Admin' },
  { id: '4', category: 'supplies', description: 'Stationery and Books', amount: 45000, date: '2024-09-10', createdBy: 'Admin' },
  { id: '5', category: 'maintenance', description: 'AC Repair', amount: 15000, date: '2024-09-12', createdBy: 'Admin' },
  { id: '6', category: 'utilities', description: 'Water Bill - August', amount: 12000, date: '2024-09-08', createdBy: 'Admin' },
  { id: '7', category: 'marketing', description: 'Social Media Ads', amount: 20000, date: '2024-09-15', createdBy: 'Admin' },
  { id: '8', category: 'payroll', description: 'Teacher Bonuses', amount: 50000, date: '2024-09-20', createdBy: 'Admin' },
];

const categoryOptions = [
  { value: 'payroll', label: 'Teacher/Staff Payroll' },
  { value: 'rent', label: 'Building Rent' },
  { value: 'utilities', label: 'Utilities/Electricity' },
  { value: 'supplies', label: 'Supplies & Materials' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
];

const categoryIcons: Record<string, React.ElementType> = {
  payroll: Users,
  rent: Building2,
  utilities: Zap,
  supplies: Package,
  maintenance: Wrench,
  marketing: Megaphone,
  other: MoreHorizontal,
};

const categoryColors: Record<string, string> = {
  payroll: 'bg-blue-100 text-blue-600',
  rent: 'bg-purple-100 text-purple-600',
  utilities: 'bg-amber-100 text-amber-600',
  supplies: 'bg-emerald-100 text-emerald-600',
  maintenance: 'bg-orange-100 text-orange-600',
  marketing: 'bg-pink-100 text-pink-600',
  other: 'bg-gray-100 text-gray-600',
};

export default function ExpensesPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [newExpense, setNewExpense] = useState({
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
  });

  const filteredExpenses = mockExpenses.filter(expense =>
    categoryFilter === 'all' || expense.category === categoryFilter
  );

  const totalExpenses = mockExpenses.reduce((sum, e) => sum + e.amount, 0);

  const expensesByCategory = categoryOptions.map(cat => ({
    ...cat,
    total: mockExpenses
      .filter(e => e.category === cat.value)
      .reduce((sum, e) => sum + e.amount, 0),
    count: mockExpenses.filter(e => e.category === cat.value).length,
  })).filter(c => c.total > 0);

  const handleSubmit = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setShowAddDialog(false);
    setNewExpense({
      category: '',
      description: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || MoreHorizontal;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">
            Track and manage school operational expenses
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Expense
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(totalExpenses / 1000).toFixed(0)}K</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Largest Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Payroll</div>
            <p className="text-xs text-muted-foreground">65% of total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">vs Last Month</CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">-5%</div>
            <p className="text-xs text-muted-foreground">Decreased</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockExpenses.length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {expensesByCategory.map((category) => {
          const Icon = categoryIcons[category.value] || MoreHorizontal;
          return (
            <Card key={category.value}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{category.label}</CardTitle>
                <div className={`h-8 w-8 rounded-lg ${categoryColors[category.value]} flex items-center justify-center`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">PKR {(category.total / 1000).toFixed(0)}K</div>
                <p className="text-xs text-muted-foreground">
                  {category.count} entries • {Math.round((category.total / totalExpenses) * 100)}% of total
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select
              options={[
                { value: 'all', label: 'All Categories' },
                ...categoryOptions,
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
            <div className="flex gap-2">
              <Input type="date" placeholder="Start date" />
              <Input type="date" placeholder="End date" />
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Entries</CardTitle>
          <CardDescription>
            {filteredExpenses.length} expenses found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-6 w-6 rounded ${categoryColors[expense.category]} flex items-center justify-center`}>
                        {getCategoryIcon(expense.category)}
                      </div>
                      <span className="capitalize">{expense.category}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>{expense.createdBy}</TableCell>
                  <TableCell className="text-right font-medium">
                    PKR {expense.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>
              Record a new operational expense
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              label="Category"
              options={categoryOptions}
              value={newExpense.category}
              onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
              placeholder="Select category"
            />

            <Input
              label="Description"
              placeholder="e.g., Electricity Bill - September"
              value={newExpense.description}
              onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))}
            />

            <Input
              label="Amount (PKR)"
              type="number"
              placeholder="0"
              value={newExpense.amount}
              onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
            />

            <Input
              label="Date"
              type="date"
              value={newExpense.date}
              onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
            />

            <Textarea
              label="Additional Notes (Optional)"
              placeholder="Any additional details..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!newExpense.category || !newExpense.description || !newExpense.amount}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
