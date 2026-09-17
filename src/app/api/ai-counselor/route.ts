import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/middleware/auth';
import {
  buildStudentContext,
  generateSystemPrompt,
  getOrCreateConversation,
  getConversationHistory,
  saveMessage,
  verifyParentAccess,
  generateAIResponse,
} from '@/lib/services/ai-counselor';

// POST /api/ai-counselor - Send message to AI counselor
export const POST = withAuth(async (req, user) => {
  const schoolId = user.schoolId!;
  
  try {
    const body = await req.json();
    const { studentId, message } = body;

    if (!studentId || !message) {
      return NextResponse.json(
        { error: 'Student ID and message are required' },
        { status: 400 }
      );
    }

    // Verify parent has access to this student
    const hasAccess = await verifyParentAccess(user.id, studentId, schoolId);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'Access denied to this student' },
        { status: 403 }
      );
    }

    // Build student context
    const context = await buildStudentContext(studentId, schoolId);
    
    // Generate system prompt with context
    const systemPrompt = generateSystemPrompt(context);

    // Get or create conversation
    const conversation = await getOrCreateConversation(user.id, studentId, schoolId);

    // Get conversation history
    const history = await getConversationHistory(conversation.id, 20);
    const formattedHistory = history.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Save user message
    await saveMessage(conversation.id, 'user', message);

    // Generate AI response
    const { response, tokensUsed } = await generateAIResponse(
      systemPrompt,
      formattedHistory,
      message
    );

    // Save assistant response
    await saveMessage(conversation.id, 'assistant', response, tokensUsed);

    return NextResponse.json({
      response,
      conversationId: conversation.id,
    });
  } catch (error: any) {
    console.error('AI Counselor error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}, { roles: ['parent'] });

// GET /api/ai-counselor - Get conversation history
export const GET = withAuth(async (req, user) => {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get('studentId');
  const schoolId = user.schoolId!;

  if (!studentId) {
    return NextResponse.json(
      { error: 'Student ID is required' },
      { status: 400 }
    );
  }

  // Verify access
  const hasAccess = await verifyParentAccess(user.id, studentId, schoolId);
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  // Get conversation
  const conversation = await getOrCreateConversation(user.id, studentId, schoolId);
  const messages = await getConversationHistory(conversation.id, 50);

  return NextResponse.json({
    conversationId: conversation.id,
    messages,
  });
}, { roles: ['parent'] });
