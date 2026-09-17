'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  TrendingUp,
  Calendar,
  AlertCircle,
  Lightbulb,
  RefreshCw,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const studentOptions = [
  { value: 'ahmed', label: 'Ahmed Khan - Grade 5-A' },
  { value: 'fatima', label: 'Fatima Khan - Grade 3-B' },
];

const suggestedQuestions = [
  "How is my child performing overall?",
  "What subjects need more attention?",
  "Can you suggest a study schedule?",
  "How is my child's attendance?",
  "What are the recent homework assignments?",
];

const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hello! I'm your AI Academic Counselor. I can help you understand your child's performance, suggest study strategies, and answer questions about their academic progress. Select a child and ask me anything!",
    timestamp: new Date(Date.now() - 60000),
  },
];

export default function AICounselorPage() {
  const [selectedStudent, setSelectedStudent] = useState('ahmed');
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputMessage.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const aiResponse = generateMockResponse(messageText);
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const generateMockResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (lowerQuestion.includes('perform') || lowerQuestion.includes('overall')) {
      return `Based on Ahmed's recent performance data:

**Overall Performance:**
- Attendance Rate: 94% (Good)
- Average Grade: 78% (B+)
- Class Rank: 15th out of 40 students

**Strengths:**
- Mathematics: 85% average (A)
- Science: 82% average (A-)

**Areas for Improvement:**
- English: 68% average (B-)
- Urdu: 72% average (B)

Ahmed is doing well overall! His math and science scores are excellent. I'd recommend focusing a bit more on English language skills.`;
    }
    
    if (lowerQuestion.includes('subject') || lowerQuestion.includes('attention')) {
      return `Based on Ahmed's grade trends, these subjects need more attention:

**1. English (Priority: High)**
- Current average: 68%
- Trend: Declining (-5% from last month)
- Suggestion: Practice reading comprehension daily for 20 minutes

**2. Urdu (Priority: Medium)**
- Current average: 72%
- Trend: Stable
- Suggestion: Focus on vocabulary building and essay writing

**Study Recommendations:**
- Dedicate 45 minutes daily to English practice
- Read one English story per week
- Practice Urdu writing 3 times per week

Would you like me to create a detailed study schedule?`;
    }
    
    if (lowerQuestion.includes('schedule') || lowerQuestion.includes('study plan')) {
      return `Here's a suggested weekly study schedule for Ahmed:

**Monday - Thursday (After School):**
- 3:00 - 3:30 PM: Rest & Snack
- 3:30 - 4:15 PM: Homework/Assignments
- 4:15 - 5:00 PM: English Practice (reading + writing)
- 5:00 - 5:30 PM: Break
- 5:30 - 6:15 PM: Mathematics Practice
- 6:15 - 7:00 PM: Science/Other subjects

**Friday:**
- Complete any pending homework
- Review week's learnings
- Light reading

**Saturday:**
- 10:00 - 11:30 AM: Urdu practice
- 11:30 AM - 12:30 PM: English story reading

**Sunday:**
- Rest day with optional light revision

**Tips:**
- Take a 5-minute break every 30 minutes
- Stay hydrated and eat healthy snacks
- Get 8-9 hours of sleep

Would you like me to adjust this based on Ahmed's preferences?`;
    }
    
    if (lowerQuestion.includes('attendance')) {
      return `Ahmed's Attendance Summary:

**Overall Attendance Rate: 94%** ✓ (Good)

**Last 30 Days:**
- Present: 18 days
- Absent: 1 day (Sep 10 - Sick leave)
- Late: 1 day (Sep 15 - 10 minutes late)

**Pattern Analysis:**
- No concerning patterns detected
- Good attendance streak: 12 consecutive days

**Impact on Learning:**
Ahmed's attendance is healthy. Regular attendance is crucial for:
- Consistent learning progression
- Participation in class discussions
- Completing in-class assignments

**Recommendation:**
Continue maintaining this excellent attendance record. If Ahmed is feeling unwell, it's okay to rest, but try to avoid unnecessary absences.`;
    }
    
    if (lowerQuestion.includes('homework') || lowerQuestion.includes('assignment') || lowerQuestion.includes('diary')) {
      return `Recent Homework/Assignments for Ahmed:

**Active Assignments:**
1. 📐 **Mathematics** (Due: Sep 20)
   - Chapter 5 exercises 5.1 to 5.3
   - Status: Not started

2. 📝 **English** (Due: Sep 19)
   - Essay: "My Favorite Season" (200 words)
   - Status: Not started

3. 🔬 **Science** (Due: Sep 22)
   - Lab Report: Plant Growth Experiment
   - Status: In progress

**Overdue:**
- None ✓

**Tips for Parents:**
- Help Ahmed create a checklist of pending assignments
- Encourage starting with the most challenging subject first
- Review completed work before submission

Would you like more details about any specific assignment?`;
    }
    
    return `Thank you for your question about Ahmed's academic progress. Based on the available data:

**Key Highlights:**
- Overall Performance: Good (78% average)
- Attendance: Excellent (94%)
- Strongest Subject: Mathematics (85%)
- Needs Improvement: English (68%)

I can provide more specific insights on:
1. Detailed subject-wise analysis
2. Study schedule recommendations
3. Attendance patterns
4. Homework and assignment tracking
5. Comparison with class performance

Please feel free to ask about any specific area you'd like to explore. I'm here to help Ahmed succeed academically!`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            AI Academic Counselor
          </h2>
          <p className="text-muted-foreground">
            Get personalized insights and recommendations for your child's academic success
          </p>
        </div>
        <Select
          options={studentOptions}
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
        />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Insights</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Get detailed analysis of your child's grades and academic trends
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Recommendations</CardTitle>
            <Lightbulb className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Receive personalized study schedules and learning strategies
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Privacy Protected</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              All conversations are private and only access your child's data
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">AI Counselor</CardTitle>
                <CardDescription>Always here to help</CardDescription>
              </div>
            </div>
            <Badge variant="success">Online</Badge>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.role === 'assistant' && (
                    <Bot className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-2 ${
                      message.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <User className="h-5 w-5 text-primary-foreground flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Suggested Questions */}
        <div className="border-t p-4">
          <p className="text-sm text-muted-foreground mb-2">Suggested questions:</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {suggestedQuestions.map((question, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(question)}
                disabled={isLoading}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask about your child's performance..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={isLoading}
              className="flex-1 h-10 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <p className="font-medium text-amber-900">Privacy Notice</p>
              <p className="text-sm text-amber-700 mt-1">
                The AI Counselor only has access to your child's academic data. It cannot see other students' information, 
                teacher contact details, or school financial records. All conversations are confidential and stored securely.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
