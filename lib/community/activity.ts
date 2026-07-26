import { prisma } from '@/lib/prisma';

export async function recordActivityFeedItem({
  userId,
  type,
  targetType,
  targetId,
  metadata,
}: {
  userId: string;
  type: 'FINISHED_BOOK' | 'WROTE_REVIEW' | 'JOINED_CLUB' | 'STARTED_DISCUSSION' | 'UNLOCKED_ACHIEVEMENT';
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
}) {
  try {
    await prisma.activityFeedItem.create({
      data: {
        userId,
        type,
        targetType,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });
  } catch (error) {
    console.error('Error recording activity feed item:', error);
  }
}
