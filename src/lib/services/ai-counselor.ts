import { db } from '@/lib/db';
import { 
  students, 
  attendance, 
  grades, 
  diaryEntries, 
  exams, 
  examSubjects, 
  subjects,
  aiConversations, 
  aiMessages,
  parentStudents 
} from '@/lib/db/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

interface StudentContext {
  student: {
    name: string;
    grade: string;
    section: string;
  };
  attendance: {
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    percentage: number;
    consecutiveAbsences: number;
  };
  grades: Array<{
    subject: string;
    assessments: Array<{
      type: string;
      marks: number;
      total: number;
      percentage: number;
      grade: string;
    }>;
    averagePercentage: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  recentDiary: Array<{
    subject: string;
    title: string;
    date: string;
    notes: string;
  }>;
  weakSubjects: string[];
  strongSubjects: string[];
}

export async function buildStudentContext(
  studentId: string,
  schoolId: string
): Promise<StudentContext> {
  // Get student info
  const student = await db.query.students.findFirst({
    where: and(
      eq(students.id, studentId),
      eq(students.schoolId, schoolId)
    ),
    with: {
      section: {
        with: {
          class: true,
        },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  // Get attendance stats (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const attendanceRecords = await db.query.attendance.findMany({
    where: and(
      eq(attendance.studentId, studentId),
      gte(attendance.date, ninetyDaysAgo)
    ),
    orderBy: (att, { desc }) => [desc(att.date)],
  });

  const totalDays = attendanceRecords.length;
  const presentDays = attendanceRecords.filter(a => a.status === 'present').length;
  const absentDays = attendanceRecords.filter(a => a.status === 'absent').length;
  const lateDays = attendanceRecords.filter(a => a.status === 'late').length;
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  // Calculate consecutive absences (most recent)
  let consecutiveAbsences = 0;
  for (const record of attendanceRecords) {
    if (record.status === 'absent') {
      consecutiveAbsences++;
    } else {
      break;
    }
  }

  // Get grades
  const gradeRecords = await db.query.grades.findMany({
    where: eq(grades.studentId, studentId),
    with: {
      examSubject: {
        with: {
          exam: true,
          subject: true,
        },
      },
    },
    orderBy: (g, { desc }) => [desc(g.createdAt)],
  });

  // Group grades by subject
  const gradesBySubject = new Map<string, typeof gradeRecords>();
  for (const grade of gradeRecords) {
    const subjectName = grade.examSubject?.subject?.name || 'Unknown';
    if (!gradesBySubject.has(subjectName)) {
      gradesBySubject.set(subjectName, []);
    }
    gradesBySubject.get(subjectName)!.push(grade);
  }

  const gradeSummary = Array.from(gradesBySubject.entries()).map(([subjectName, subjectGrades]) => {
    const assessments = subjectGrades.map(g => ({
      type: g.examSubject?.exam?.examType || 'unknown',
      marks: parseFloat(g.marksObtained),
      total: g.examSubject?.totalMarks || 100,
      percentage: Math.round((parseFloat(g.marksObtained) / (g.examSubject?.totalMarks || 100)) * 100),
      grade: g.grade || '',
    }));

    const percentages = assessments.map(a => a.percentage);
    const averagePercentage = percentages.length > 0
      ? Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length)
      : 0;

    // Simple trend calculation (compare first half vs second half)
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (percentages.length >= 2) {
      const mid = Math.floor(percentages.length / 2);
      const recentAvg = percentages.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
      const olderAvg = percentages.slice(mid).reduce((a, b) => a + b, 0) / (percentages.length - mid);
      
      if (recentAvg > olderAvg + 5) trend = 'improving';
      else if (recentAvg < olderAvg - 5) trend = 'declining';
    }

    return {
      subject: subjectName,
      assessments,
      averagePercentage,
      trend,
    };
  });

  // Identify weak and strong subjects
  const subjectAverages = gradeSummary.map(g => ({
    subject: g.subject,
    average: g.averagePercentage,
  }));

  const weakSubjects = subjectAverages
    .filter(s => s.average < 60)
    .sort((a, b) => a.average - b.average)
    .map(s => s.subject);

  const strongSubjects = subjectAverages
    .filter(s => s.average >= 80)
    .sort((a, b) => b.average - a.average)
    .map(s => s.subject);

  // Get recent diary entries
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentDiary = await db.query.diaryEntries.findMany({
    where: and(
      eq(diaryEntries.sectionId, student.sectionId),
      gte(diaryEntries.entryDate, thirtyDaysAgo)
    ),
    with: {
      subject: true,
    },
    orderBy: (d, { desc }) => [desc(d.entryDate)],
    limit: 10,
  });

  return {
    student: {
      name: `${student.firstName} ${student.lastName}`,
      grade: student.section?.class?.name || 'Unknown',
      section: student.section?.name || 'Unknown',
    },
    attendance: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      percentage,
      consecutiveAbsences,
    },
    grades: gradeSummary,
    recentDiary: recentDiary.map(d => ({
      subject: d.subject?.name || 'General',
      title: d.title,
      date: d.entryDate.toISOString().split('T')[0],
      notes: d.content.substring(0, 200),
    })),
    weakSubjects,
    strongSubjects,
  };
}

export function generateSystemPrompt(context: StudentContext): string {
  return `You are an empathetic and constructive academic counselor for parents. You are helping a parent understand their child's academic performance and provide actionable advice.

STUDENT CONTEXT (use ONLY this data - do not invent or assume anything else):

Student: ${context.student.name}
Grade: ${context.student.grade} - Section ${context.student.section}

ATTENDANCE (Last 90 days):
- Total School Days: ${context.attendance.totalDays}
- Present: ${context.attendance.presentDays} days
- Absent: ${context.attendance.absentDays} days
- Late: ${context.attendance.lateDays} days
- Attendance Rate: ${context.attendance.percentage}%
- Recent Consecutive Absences: ${context.attendance.consecutiveAbsences} days

ACADEMIC PERFORMANCE:
${context.grades.map(g => `
Subject: ${g.subject}
- Average: ${g.averagePercentage}%
- Trend: ${g.trend}
- Recent Assessments: ${g.assessments.slice(0, 3).map(a => `${a.type}: ${a.marks}/${a.total} (${a.percentage}%)`).join(', ')}
`).join('\n')}

${context.weakSubjects.length > 0 ? `WEAK SUBJECTS (needs focus): ${context.weakSubjects.join(', ')}` : ''}
${context.strongSubjects.length > 0 ? `STRONG SUBJECTS: ${context.strongSubjects.join(', ')}` : ''}

RECENT HOMEWORK/DIARY:
${context.recentDiary.map(d => `- [${d.date}] ${d.subject}: ${d.title}`).join('\n') || 'No recent entries'}

GUIDELINES:
1. Be empathetic, supportive, and constructive
2. Provide specific, actionable study advice based on the data
3. If attendance is low, gently discuss the importance of regular attendance
4. For weak subjects, suggest specific study techniques and schedules
5. Celebrate strengths and improvements
6. Never disclose information about other students
7. Never share teacher contact details or school financial information
8. If asked about something outside your data, politely explain you can only discuss the student's performance
9. Keep responses concise but helpful
10. Use simple, clear language that parents can easily understand`;
}

export async function getOrCreateConversation(
  parentId: string,
  studentId: string,
  schoolId: string
) {
  let conversation = await db.query.aiConversations.findFirst({
    where: and(
      eq(aiConversations.parentId, parentId),
      eq(aiConversations.studentId, studentId)
    ),
  });

  if (!conversation) {
    const [newConv] = await db.insert(aiConversations).values({
      schoolId,
      parentId,
      studentId,
    }).returning();
    conversation = newConv;
  }

  return conversation;
}

export async function getConversationHistory(conversationId: string, limit: number = 20) {
  return db.query.aiMessages.findMany({
    where: eq(aiMessages.conversationId, conversationId),
    orderBy: (msgs, { asc }) => [asc(msgs.createdAt)],
    limit,
  });
}

export async function saveMessage(
  conversationId: string,
  role: 'user' | 'assistant',
  content: string,
  tokensUsed?: number
) {
  const [message] = await db.insert(aiMessages).values({
    conversationId,
    role,
    content,
    tokensUsed,
  }).returning();

  // Update conversation last message time
  await db.update(aiConversations)
    .set({ lastMessageAt: new Date() })
    .where(eq(aiConversations.id, conversationId));

  return message;
}

export async function verifyParentAccess(
  parentId: string,
  studentId: string,
  schoolId: string
): Promise<boolean> {
  const link = await db.query.parentStudents.findFirst({
    where: and(
      eq(parentStudents.parentId, parentId),
      eq(parentStudents.studentId, studentId),
      eq(parentStudents.schoolId, schoolId)
    ),
  });

  return !!link;
}

// Generate AI response (placeholder - integrate with your preferred LLM)
export async function generateAIResponse(
  systemPrompt: string,
  conversationHistory: Array<{ role: string; content: string }>,
  userMessage: string
): Promise<{ response: string; tokensUsed: number }> {
  // This is a placeholder implementation
  // In production, integrate with OpenAI, Anthropic, or another LLM provider
  
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];

  // Example with OpenAI:
  // const response = await openai.chat.completions.create({
  //   model: 'gpt-4',
  //   messages,
  //   max_tokens: 500,
  //   temperature: 0.7,
  // });
  // return {
  //   response: response.choices[0].message.content,
  //   tokensUsed: response.usage?.total_tokens || 0,
  // };

  // Placeholder response
  return {
    response: "I'm the AI Academic Counselor. Based on the student's data, I can provide insights and recommendations. However, the AI integration needs to be configured with an LLM provider. Please contact your administrator to set up the AI service.",
    tokensUsed: 0,
  };
}
