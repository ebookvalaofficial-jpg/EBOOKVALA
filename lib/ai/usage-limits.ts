import { prisma } from '@/lib/prisma';

export type AIFeatureType = 'CHAT' | 'SUMMARY' | 'FLASHCARDS' | 'QUIZ' | 'TRANSLATE' | 'NARRATE';

export interface PlanLimits {
  CHAT: number;
  SUMMARY: number;
  FLASHCARDS: number;
  QUIZ: number;
  TRANSLATE: number;
  NARRATE: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  FREE: { CHAT: 0, SUMMARY: 0, FLASHCARDS: 0, QUIZ: 0, TRANSLATE: 0, NARRATE: 0 },
  STARTER: { CHAT: 0, SUMMARY: 0, FLASHCARDS: 0, QUIZ: 0, TRANSLATE: 0, NARRATE: 0 },
  READER: { CHAT: 0, SUMMARY: 20, FLASHCARDS: 0, QUIZ: 0, TRANSLATE: 0, NARRATE: 0 },
  PLUS: { CHAT: 100, SUMMARY: 9999, FLASHCARDS: 30, QUIZ: 30, TRANSLATE: 9999, NARRATE: 0 },
  PRO: { CHAT: 9999, SUMMARY: 9999, FLASHCARDS: 9999, QUIZ: 9999, TRANSLATE: 9999, NARRATE: 9999 },
};

export const REQUIRED_PLAN_FOR_FEATURE: Record<AIFeatureType, string> = {
  SUMMARY: 'READER',
  CHAT: 'PLUS',
  FLASHCARDS: 'PLUS',
  QUIZ: 'PLUS',
  TRANSLATE: 'PLUS',
  NARRATE: 'PRO',
};

export async function checkAndLogAIUsage(
  userId: string,
  feature: AIFeatureType
): Promise<{
  allowed: boolean;
  userPlan: string;
  limit: number;
  currentUsage: number;
  requiredPlan: string;
  message?: string;
}> {
  // Fetch active user subscription
  const sub = await prisma.subscription.findUnique({
    where: { userId },
  });

  const userPlan = (sub?.status === 'ACTIVE' ? sub.plan : 'FREE') || 'FREE';
  const limits = PLAN_LIMITS[userPlan] || PLAN_LIMITS.FREE;
  const featureLimit = limits[feature];
  const requiredPlan = REQUIRED_PLAN_FOR_FEATURE[feature];

  // If plan does not grant feature access
  if (featureLimit === 0) {
    return {
      allowed: false,
      userPlan,
      limit: 0,
      currentUsage: 0,
      requiredPlan,
      message: `The ${feature} feature is gated. Upgrade to ${requiredPlan} or above to unlock access.`,
    };
  }

  // Count usage logs in current calendar month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const currentUsage = await prisma.aIUsageLog.count({
    where: {
      userId,
      feature,
      createdAt: { gte: startOfMonth },
    },
  });

  if (currentUsage >= featureLimit) {
    return {
      allowed: false,
      userPlan,
      limit: featureLimit,
      currentUsage,
      requiredPlan: userPlan === 'READER' ? 'PLUS' : 'PRO',
      message: `You've reached your monthly limit of ${featureLimit} for ${feature}. Upgrade your plan for higher/unlimited usage.`,
    };
  }

  // Record usage log
  await prisma.aIUsageLog.create({
    data: {
      userId,
      feature,
    },
  });

  return {
    allowed: true,
    userPlan,
    limit: featureLimit,
    currentUsage: currentUsage + 1,
    requiredPlan,
  };
}
