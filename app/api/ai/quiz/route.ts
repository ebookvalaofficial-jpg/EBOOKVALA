import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAICompletion } from '@/lib/ai/anthropic';
import { checkAndLogAIUsage } from '@/lib/ai/usage-limits';
import { aiQuizSchema, aiQuizSubmitSchema } from '@/lib/validations/ai';

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

    const quizAttempts = await prisma.quizAttempt.findMany({
      where: { userId: user.id, bookId },
      orderBy: { completedAt: 'desc' },
      take: 5,
    });

    const bestScore = quizAttempts.reduce((max, a) => Math.max(max, a.score), 0);

    return NextResponse.json({
      attempts: quizAttempts,
      bestScore,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch quiz history' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiQuizSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const chapterIdKey = validated.chapterId || null;

    // 1. CHECK CACHE FIRST: Do not call Anthropic API if cached quiz questions exist
    const cachedQuestions = await prisma.quizQuestion.findMany({
      where: {
        bookId: validated.bookId,
        chapterId: chapterIdKey,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (cachedQuestions.length > 0) {
      const formatted = cachedQuestions.map((q) => ({
        id: q.id,
        question: q.question,
        options: JSON.parse(q.options),
        correctAnswerIndex: q.correctAnswerIndex,
        explanation: q.explanation,
      }));

      return NextResponse.json({
        questions: formatted,
        isCached: true,
      });
    }

    // 2. Check Usage Limits
    const usageCheck = await checkAndLogAIUsage(user.id, 'QUIZ');
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

    let textToAnalyze = book?.description || '';
    if (validated.chapterId) {
      const chapter = book?.chapters.find((c) => c.id === validated.chapterId);
      if (chapter) textToAnalyze = chapter.content.replace(/<[^>]*>?/gm, '');
    }

    const systemPrompt = `You generate multiple-choice quiz questions from book text. Respond ONLY with a valid JSON array of objects. Each object must have: "question" (string), "options" (array of 4 strings), "correctAnswerIndex" (0-3 integer), and "explanation" (string). Generate 3 questions. Do not include markdown codeblocks or extra conversational text.`;
    const userMessage = `Generate quiz for "${book?.title}":\n\n${textToAnalyze.slice(0, 3000)}`;

    const rawAIResponse = await generateAICompletion({ systemPrompt, userMessage });

    let parsedQuiz: {
      question: string;
      options: string[];
      correctAnswerIndex: number;
      explanation: string;
    }[] = [];

    try {
      const cleanJson = rawAIResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedQuiz = JSON.parse(cleanJson);
    } catch {
      parsedQuiz = [
        {
          question: 'What is the primary key to long-term habit compounding?',
          options: ['Daily 1% improvements', 'Occasional high effort', 'Strict perfectionism', 'Ignoring environmental cues'],
          correctAnswerIndex: 0,
          explanation: 'Compounding small daily gains yields exponential growth over time.',
        },
        {
          question: 'What type of habit change yields the deepest behavioral persistence?',
          options: ['Outcome-based', 'Identity-based', 'Reward-only', 'Punishment-based'],
          correctAnswerIndex: 1,
          explanation: 'Identity-based habits realign internal beliefs with target outcomes.',
        },
      ];
    }

    // Cache generated quiz questions in DB
    const createdQuestions = await Promise.all(
      parsedQuiz.map((q) =>
        prisma.quizQuestion.create({
          data: {
            bookId: validated.bookId,
            chapterId: chapterIdKey,
            question: q.question,
            options: JSON.stringify(q.options),
            correctAnswerIndex: q.correctAnswerIndex,
            explanation: q.explanation,
          },
        })
      )
    );

    const formatted = createdQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options),
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation,
    }));

    return NextResponse.json({
      questions: formatted,
      isCached: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate quiz' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiQuizSubmitSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const attempt = await prisma.quizAttempt.create({
      data: {
        userId: user.id,
        bookId: validated.bookId,
        score: validated.score,
        totalQuestions: validated.totalQuestions,
      },
    });

    return NextResponse.json({ attempt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save quiz attempt' }, { status: 500 });
  }
}
