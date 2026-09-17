'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  Plus,
  Calendar,
  BookOpen,
  Clock,
  Send,
  Edit,
  Trash2,
  FileText,
} from 'lucide-react';

interface DiaryEntry {
  id: string;
  subject: string;
  title: string;
  content: string;
  date: string;
  dueDate?: string;
  attachments: string[];
}

const mockEntries: DiaryEntry[] = [
  {
    id: '1',
    subject: 'Mathematics',
    title: 'Chapter 5 - Fractions Homework',
    content: 'Complete exercises 5.1 to 5.3 from the textbook. Show all working steps. Due date: Friday.',
    date: '2024-09-17',
    dueDate: '2024-09-20',
    attachments: [],
  },
  {
    id: '2',
    subject: 'English',
    title: 'Essay Writing - My Favorite Season',
    content: 'Write a 200-word essay about your favorite season. Include at least 3 adjectives and 2 comparisons.',
    date: '2024-09-17',
    dueDate: '2024-09-19',
    attachments: [],
  },
  {
    id: '3',
    subject: 'Science',
    title: 'Lab Report - Plant Growth Experiment',
    content: 'Record observations from the plant growth experiment. Include measurements and sketches.',
    date: '2024-09-16',
    dueDate: '2024-09-22',
    attachments: ['experiment_template.pdf'],
  },
  {
    id: '4',
    subject: 'Mathematics',
    title: 'Test Preparation - Multiplication Tables',
    content: 'Practice multiplication tables from 2 to 12. There will be a timed test on Thursday.',
    date: '2024-09-16',
    attachments: [],
  },
  {
    id: '5',
    subject: 'Social Studies',
    title: 'Map Work - Continents and Oceans',
    content: 'Label all 7 continents and 5 oceans on the worksheet provided in class.',
    date: '2024-09-15',
    dueDate: '2024-09-18',
    attachments: ['world_map_worksheet.pdf'],
  },
];

const subjectOptions = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'english', label: 'English' },
  { value: 'science', label: 'Science' },
  { value: 'social_studies', label: 'Social Studies' },
  { value: 'urdu', label: 'Urdu' },
  { value: 'islamic_studies', label: 'Islamic Studies' },
  { value: 'computer', label: 'Computer Science' },
  { value: 'art', label: 'Art & Craft' },
  { value: 'physical_education', label: 'Physical Education' },
  { value: 'general', label: 'General Announcement' },
];

const classOptions = [
  { value: 'grade5a', label: 'Grade 5 - Section A' },
  { value: 'grade5b', label: 'Grade 5 - Section B' },
  { value: 'grade6a', label: 'Grade 6 - Section A' },
];

export default function DiaryPage() {
  const [showNewEntry, setShowNewEntry] = useState(false);
  const [entries, setEntries] = useState<DiaryEntry[]>(mockEntries);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntry, setNewEntry] = useState({
    subject: '',
    title: '',
    content: '',
    dueDate: '',
  });

  const handleSubmit = async () => {
    // Simulate API call
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      subject: subjectOptions.find(s => s.value === newEntry.subject)?.label || newEntry.subject,
      title: newEntry.title,
      content: newEntry.content,
      date: selectedDate,
      dueDate: newEntry.dueDate || undefined,
      attachments: [],
    };
    
    setEntries(prev => [entry, ...prev]);
    setNewEntry({ subject: '', title: '', content: '', dueDate: '' });
    setShowNewEntry(false);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Classroom Diary</h2>
          <p className="text-muted-foreground">
            Post homework, assignments, and announcements for parents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowNewEntry(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      {/* Date Selector */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="flex items-end gap-2">
              <Button variant="outline" size="sm" onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() - 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}>
                Previous Day
              </Button>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const date = new Date(selectedDate);
                date.setDate(date.getDate() + 1);
                setSelectedDate(date.toISOString().split('T')[0]);
              }}>
                Next Day
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.filter(e => e.date === selectedDate).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Homework</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {entries.filter(e => e.dueDate && !isOverdue(e.dueDate)).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {entries.filter(e => isOverdue(e.dueDate)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Diary Entries */}
      <div className="space-y-4">
        {entries.filter(e => e.date === selectedDate).length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No entries for this date</p>
                <Button variant="outline" className="mt-4" onClick={() => setShowNewEntry(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          entries
            .filter(e => e.date === selectedDate)
            .map((entry) => (
              <Card key={entry.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{entry.title}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mr-2">{entry.subject}</Badge>
                          {entry.dueDate && (
                            <span className={isOverdue(entry.dueDate) ? 'text-red-600' : ''}>
                              Due: {formatDate(entry.dueDate)}
                              {isOverdue(entry.dueDate) && ' (Overdue)'}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {entry.content}
                  </p>
                  {entry.attachments.length > 0 && (
                    <div className="mt-4 flex gap-2">
                      {entry.attachments.map((attachment, i) => (
                        <Badge key={i} variant="outline">
                          <FileText className="mr-1 h-3 w-3" />
                          {attachment}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
          <CardDescription>Previous diary entries</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {entries
              .filter(e => e.date !== selectedDate)
              .slice(0, 5)
              .map((entry) => (
                <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="flex-1">
                    <p className="font-medium">{entry.title}</p>
                    <p className="text-sm text-muted-foreground">
                      <Badge variant="outline" className="mr-2">{entry.subject}</Badge>
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  {entry.dueDate && (
                    <Badge variant={isOverdue(entry.dueDate) ? 'destructive' : 'default'}>
                      {isOverdue(entry.dueDate) ? 'Overdue' : `Due ${formatDate(entry.dueDate)}`}
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={showNewEntry} onOpenChange={setShowNewEntry}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Diary Entry</DialogTitle>
            <DialogDescription>
              Create a new homework assignment or announcement
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Select
              label="Subject"
              options={subjectOptions}
              value={newEntry.subject}
              onChange={(e) => setNewEntry(prev => ({ ...prev, subject: e.target.value }))}
              placeholder="Select subject"
            />

            <Input
              label="Title"
              placeholder="e.g., Chapter 5 Homework"
              value={newEntry.title}
              onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
            />

            <Textarea
              label="Content"
              placeholder="Describe the homework or announcement..."
              value={newEntry.content}
              onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
            />

            <Input
              label="Due Date (Optional)"
              type="date"
              value={newEntry.dueDate}
              onChange={(e) => setNewEntry(prev => ({ ...prev, dueDate: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewEntry(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!newEntry.subject || !newEntry.title || !newEntry.content}
            >
              <Send className="mr-2 h-4 w-4" />
              Publish Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
