import { z } from 'zod';
import { isSafeUrl } from '@/lib/sanitize';

export const createDiscussionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150, 'Title too long'),
  body: z.string().min(10, 'Body must be at least 10 characters'),
  bookId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
});

export const createReplySchema = z.object({
  body: z.string().min(2, 'Reply must be at least 2 characters'),
  parentReplyId: z.string().optional().nullable(),
});

export const createClubSchema = z.object({
  name: z.string().min(3, 'Club name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  coverImageUrl: z.string().optional().nullable().refine((val) => isSafeUrl(val), {
    message: 'Invalid cover image URL scheme',
  }),
  currentBookId: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
  memberLimit: z.number().min(2).optional().nullable(),
});

export const createReportSchema = z.object({
  targetType: z.enum(['DISCUSSION', 'REPLY', 'REVIEW', 'USER']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.enum(['Spam', 'Harassment', 'Inappropriate Content', 'Other']),
  details: z.string().optional().nullable(),
});

export const reactionSchema = z.object({
  targetType: z.enum(['DISCUSSION', 'REPLY', 'REVIEW']),
  targetId: z.string().min(1, 'Target ID required'),
  type: z.enum(['LIKE', 'INSIGHTFUL', 'LOVE']),
});
