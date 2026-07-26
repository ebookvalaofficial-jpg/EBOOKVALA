import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAICompletion } from '@/lib/ai/anthropic';
import { checkAndLogAIUsage } from '@/lib/ai/usage-limits';
import { aiChatSchema } from '@/lib/validations/ai';

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const bookId = url.searchParams.get('bookId');
    if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const chatSession = await prisma.aIChatSession.findUnique({
      where: {
        userId_bookId: { userId: user.id, bookId },
      },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });

    return NextResponse.json({
      messages: chatSession?.messages || [],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch chat history' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiChatSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check usage limits
    const usageCheck = await checkAndLogAIUsage(user.id, 'CHAT');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: usageCheck.message,
        isGated: true,
        requiredPlan: usageCheck.requiredPlan,
      }, { status: 403 });
    }

    // Fetch Book & Chapter context
    const book = await prisma.book.findUnique({
      where: { id: validated.bookId },
      include: { chapters: true },
    });

    let chapterContext = '';
    if (validated.chapterId) {
      const chapter = book?.chapters.find((c) => c.id === validated.chapterId);
      if (chapter) chapterContext = chapter.content.replace(/<[^>]*>?/gm, '').slice(0, 3000);
    }

    if (!chapterContext && book?.description) {
      chapterContext = book.description;
    }

    // Retrieve or create ChatSession
    let chatSession = await prisma.aIChatSession.findUnique({
      where: {
        userId_bookId: { userId: user.id, bookId: validated.bookId },
      },
    });

    if (!chatSession) {
      chatSession = await prisma.aIChatSession.create({
        data: {
          userId: user.id,
          bookId: validated.bookId,
        },
      });
    }

    // Persist User Message
    await prisma.aIChatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'USER',
        content: validated.prompt,
      },
    });

    // Generate AI response
    const systemPrompt = `You are EbookVala AI Reading Assistant for the book "${book?.title || 'Book'}". Answer user questions accurately and concisely using this chapter context: "${chapterContext}". Be encouraging, insightful, and clear.`;
    const aiResponseText = await generateAICompletion({
      systemPrompt,
      userMessage: validated.prompt,
    });

    // Persist AI Message
    const assistantMsg = await prisma.aIChatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: 'ASSISTANT',
        content: aiResponseText,
      },
    });

    // Return updated conversation messages
    const allMessages = await prisma.aIChatMessage.findMany({
      where: { sessionId: chatSession.id },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({
      messages: allMessages,
      latestResponse: assistantMsg,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process AI chat' }, { status: 500 });
  }
}
