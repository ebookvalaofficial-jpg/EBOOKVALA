import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateAICompletion } from '@/lib/ai/anthropic';
import { checkAndLogAIUsage } from '@/lib/ai/usage-limits';
import { aiTranslateSchema } from '@/lib/validations/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiTranslateSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check Usage Limits
    const usageCheck = await checkAndLogAIUsage(user.id, 'TRANSLATE');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: usageCheck.message,
        isGated: true,
        requiredPlan: usageCheck.requiredPlan,
      }, { status: 403 });
    }

    const systemPrompt = `You are an expert literary translator. Translate the provided book text accurately and naturally into ${validated.targetLanguage}. Preserve paragraph structures and tone. Output ONLY the translated text.`;
    const userMessage = `Translate to ${validated.targetLanguage}:\n\n${validated.textSnippet.slice(0, 3000)}`;

    const translatedText = await generateAICompletion({ systemPrompt, userMessage });

    return NextResponse.json({
      translatedText,
      targetLanguage: validated.targetLanguage,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to translate text' }, { status: 500 });
  }
}
