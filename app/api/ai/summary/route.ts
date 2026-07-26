import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAICompletion } from '@/lib/ai/anthropic';
import { checkAndLogAIUsage } from '@/lib/ai/usage-limits';
import { aiSummarySchema } from '@/lib/validations/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiSummarySchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const chapterIdKey = validated.chapterId || null;

    // 1. CHECK CACHE FIRST: Do not call Anthropic API if cached summary already exists
    const cachedSummary = await prisma.aISummary.findFirst({
      where: {
        bookId: validated.bookId,
        chapterId: chapterIdKey,
      },
    });

    if (cachedSummary) {
      return NextResponse.json({
        summary: cachedSummary.content,
        isCached: true,
      });
    }

    // 2. Check Usage Limits
    const usageCheck = await checkAndLogAIUsage(user.id, 'SUMMARY');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: usageCheck.message,
        isGated: true,
        requiredPlan: usageCheck.requiredPlan,
      }, { status: 403 });
    }

    // Fetch Book / Chapter text
    const book = await prisma.book.findUnique({
      where: { id: validated.bookId },
      include: { chapters: true },
    });

    let textToSummarize = book?.description || '';
    let chapterTitle = 'Whole Book';

    if (validated.chapterId) {
      const chapter = book?.chapters.find((c) => c.id === validated.chapterId);
      if (chapter) {
        textToSummarize = chapter.content.replace(/<[^>]*>?/gm, '');
        chapterTitle = chapter.title;
      }
    }

    const systemPrompt = `You are a world-class executive book summarizer. Create a concise, structured AI summary of this text with bullet points, main insights, and action steps. Format nicely with Markdown.`;
    const userMessage = `Summarize chapter/book "${chapterTitle}" of "${book?.title}":\n\n${textToSummarize.slice(0, 4000)}`;

    const generatedContent = await generateAICompletion({ systemPrompt, userMessage });

    // Cache generated summary in DB
    const savedSummary = await prisma.aISummary.create({
      data: {
        bookId: validated.bookId,
        chapterId: chapterIdKey,
        content: generatedContent,
      },
    });

    return NextResponse.json({
      summary: savedSummary.content,
      isCached: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate AI summary' }, { status: 500 });
  }
}
