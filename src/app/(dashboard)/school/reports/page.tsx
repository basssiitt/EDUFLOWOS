'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

const monthlyData = [
  { month: 'Jan', revenue: 2500000, expenses: 1800000, profit: 700000 },
  { month: 'Feb', revenue: 2600000, expenses: 1750000, profit: 850000 },
  { month: 'Mar', revenue: 2700000, expenses: 1900000, profit: 800000 },
  { month: 'Apr', revenue: 2550000, expenses: 1850000, profit: 700000 },
  { month: 'May', revenue: 2800000, expenses: 1950000, profit: 850000 },
  { month: 'Jun', revenue: 2400000, expenses: 1700000, profit: 700000 },
  { month: 'Jul', revenue: 2200000, expenses: 1600000, profit: 600000 },
  { month: 'Aug', revenue: 2900000, expenses: 2000000, profit: 900000 },
  { month: 'Sep', revenue: 2850000, expenses: 1850000, profit: 1000000 },
];

const expenseBreakdown = [
  { category: 'Teacher/Staff Payroll', amount: 1200000, percentage: 65 },
  { category: 'Building Rent', amount: 250000, percentage: 14 },
  { category: 'Utilities/Electricity', amount: 150000, percentage: 8 },
  { category: 'Supplies & Materials', amount: 100000, percentage: 5 },
  { category: 'Maintenance', amount: 80000, percentage: 4 },
  { category: 'Marketing', amount: 40000, percentage: 2 },
  { category: 'Other', amount: 30000, percentage: 2 },
];

const recentTransactions = [
  { id: 1, type: 'income', description: 'Fee Collection - September', amount: 2850000, date: '2024-09-15' },
  { id: 2, type: 'expense', description: 'Staff Salaries - September', amount: 1200000, date: '2024-09-01' },
  { id: 3, type: 'expense', description: 'Building Rent - September', amount: 250000, date: '2024-09-01' },
  { id: 4, type: 'expense', description: 'Electricity Bill - August', amount: 85000, date: '2024-09-05' },
  { id: 5, type: 'income', description: 'Late Fee Collection', amount: 45000, date: '2024-09-12' },
];

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024');

  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  const revenueChange = ((currentMonth.revenue - previousMonth.revenue) / previousMonth.revenue * 100).toFixed(1);
  const expenseChange = ((currentMonth.expenses - previousMonth.expenses) / previousMonth.expenses * 100).toFixed(1);
  const profitChange = ((currentMonth.profit - previousMonth.profit) / previousMonth.profit * 100).toFixed(1);

  const ytdRevenue = monthlyData.reduce((sum, m) => sum + m.revenue, 0);
  const ytdExpenses = monthlyData.reduce((sum, m) => sum + m.expenses, 0);
  const ytdProfit = ytdRevenue - ytdExpenses;
  const profitMargin = ((ytdProfit / ytdRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profit & Loss Report</h2>
          <p className="text-muted-foreground">
            Financial overview and analytics for your school
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={[
              { value: '2024', label: '2024' },
              { value: '2023', label: '2023' },
            ]}
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          />
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(ytdRevenue / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +{revenueChange}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">YTD Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">PKR {(ytdExpenses / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600 flex items-center">
                <ArrowDownRight className="mr-1 h-3 w-3" />
                {expenseChange}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">PKR {(ytdProfit / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-emerald-600 flex items-center">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                +{profitChange}% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">
              Healthy margin
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Revenue vs Expenses over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyData.map((month) => (
                <div key={month.month} className="flex items-center gap-4">
                  <span className="w-8 text-sm font-medium">{month.month}</span>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-emerald-500 rounded-full h-2"
                          style={{ width: `${(month.revenue / 3000000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-emerald-600 w-24 text-right">
                        {(month.revenue / 100000).toFixed(0)}L
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-red-500 rounded-full h-2"
                          style={{ width: `${(month.expenses / 3000000) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-red-600 w-24 text-right">
                        {(month.expenses / 100000).toFixed(0)}L
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span>Expenses</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>Where the money goes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenseBreakdown.map((expense) => (
                <div key={expense.category} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{expense.category}</span>
                      <span className="text-sm text-muted-foreground">
                        PKR {(expense.amount / 1000).toFixed(0)}K
                      </span>
                    </div>
                    <div className="bg-muted rounded-full h-2">
                      <div
                        className="bg-primary rounded-full h-2"
                        style={{ width: `${expense.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium w-12 text-right">
                    {expense.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed P&L Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed P&L Statement</CardTitle>
          <CardDescription>Year-to-date financial summary</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount (PKR)</TableHead>
                <TableHead className="text-right">% of Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="font-medium">
                <TableCell>Revenue</TableCell>
                <TableCell className="text-right">{ytdRevenue.toLocaleString()}</TableCell>
                <TableCell className="text-right">100%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Tuition Fees</TableCell>
                <TableCell className="text-right">{(ytdRevenue * 0.85).toLocaleString()}</TableCell>
                <TableCell className="text-right">85%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Transport Fees</TableCell>
                <TableCell className="text-right">{(ytdRevenue * 0.10).toLocaleString()}</TableCell>
                <TableCell className="text-right">10%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Other Income</TableCell>
                <TableCell className="text-right">{(ytdRevenue * 0.05).toLocaleString()}</TableCell>
                <TableCell className="text-right">5%</TableCell>
              </TableRow>
              
              <TableRow className="font-medium border-t-2">
                <TableCell>Expenses</TableCell>
                <TableCell className="text-right">{ytdExpenses.toLocaleString()}</TableCell>
                <TableCell className="text-right">{((ytdExpenses / ytdRevenue) * 100).toFixed(0)}%</TableCell>
              </TableRow>
              {expenseBreakdown.map((expense) => (
                <TableRow key={expense.category}>
                  <TableCell className="pl-8">{expense.category}</TableCell>
                  <TableCell className="text-right">
                    {(expense.amount * 9).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {(((expense.amount * 9) / ytdRevenue) * 100).toFixed(0)}%
                  </TableCell>
                </TableRow>
              ))}
              
              <TableRow className="font-bold text-lg border-t-2">
                <TableCell>Net Profit</TableCell>
                <TableCell className="text-right text-emerald-600">
                  {ytdProfit.toLocaleString()}
                </TableCell>
                <TableCell className="text-right text-emerald-600">
                  {profitMargin}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest income and expense entries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{transaction.description}</TableCell>
                  <TableCell>
                    <Badge variant={transaction.type === 'income' ? 'success' : 'destructive'}>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-medium ${
                    transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'} PKR {transaction.amount.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
