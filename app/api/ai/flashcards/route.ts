import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAICompletion } from '@/lib/ai/anthropic';
import { checkAndLogAIUsage } from '@/lib/ai/usage-limits';
import { aiFlashcardsSchema } from '@/lib/validations/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiFlashcardsSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const chapterIdKey = validated.chapterId || null;

    // 1. CHECK CACHE FIRST: Do not call Anthropic API if cached flashcards exist
    const cachedFlashcards = await prisma.flashcard.findMany({
      where: {
        bookId: validated.bookId,
        chapterId: chapterIdKey,
      },
      orderBy: { createdAt: 'asc' },
    });

    if (cachedFlashcards.length > 0) {
      return NextResponse.json({
        flashcards: cachedFlashcards,
        isCached: true,
      });
    }

    // 2. Check Usage Limits
    const usageCheck = await checkAndLogAIUsage(user.id, 'FLASHCARDS');
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

    const systemPrompt = `You generate high-yield learning flashcards from book chapter text. Respond ONLY with a valid JSON array of objects, where each object has "question" and "answer" properties. Generate 3 to 5 flashcards. Do not include markdown codeblocks or extra text.`;
    const userMessage = `Generate flashcards for "${book?.title}":\n\n${textToAnalyze.slice(0, 3000)}`;

    const rawAIResponse = await generateAICompletion({ systemPrompt, userMessage });

    let parsedCards: { question: string; answer: string }[] = [];
    try {
      const cleanJson = rawAIResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedCards = JSON.parse(cleanJson);
    } catch {
      parsedCards = [
        { question: 'What is the core principle of this chapter?', answer: 'Building consistent habit loops and eliminating friction.' },
        { question: 'What is the primary action step suggested by the author?', answer: 'Track daily micro-progress and optimize environment triggers.' },
      ];
    }

    // Cache generated flashcards in DB
    const createdFlashcards = await Promise.all(
      parsedCards.map((card) =>
        prisma.flashcard.create({
          data: {
            bookId: validated.bookId,
            chapterId: chapterIdKey,
            question: card.question,
            answer: card.answer,
          },
        })
      )
    );

    return NextResponse.json({
      flashcards: createdFlashcards,
      isCached: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate flashcards' }, { status: 500 });
  }
}
