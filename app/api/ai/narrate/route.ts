import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateTextToSpeech } from '@/lib/ai/tts';
import { checkAndLogAIUsage } from '@/lib/ai/usage-limits';
import { aiNarrateSchema } from '@/lib/validations/ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = aiNarrateSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Check Usage Limits (Pro Only Feature)
    const usageCheck = await checkAndLogAIUsage(user.id, 'NARRATE');
    if (!usageCheck.allowed) {
      return NextResponse.json({
        error: usageCheck.message,
        isGated: true,
        requiredPlan: usageCheck.requiredPlan,
      }, { status: 403 });
    }

    const ttsResult = await generateTextToSpeech(validated.textSnippet);

    return NextResponse.json({
      audioUrl: ttsResult.audioUrl,
      isMockFallback: ttsResult.isMockFallback,
      message: ttsResult.message,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate voice narration' }, { status: 500 });
  }
}
