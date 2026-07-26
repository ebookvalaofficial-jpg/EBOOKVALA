import { z } from 'zod';

export const updateProgressSchema = z.object({
  currentChapterId: z.string().min(1, 'Chapter ID is required'),
  scrollPositionPercent: z.number().min(0).max(100),
  percentComplete: z.number().min(0).max(100),
  readingTimeSeconds: z.number().min(0).optional(),
});

export const createBookmarkSchema = z.object({
  chapterId: z.string().min(1, 'Chapter ID is required'),
  scrollPositionPercent: z.number().min(0).max(100),
  label: z.string().optional(),
});

export const createHighlightSchema = z.object({
  chapterId: z.string().min(1, 'Chapter ID is required'),
  selectedText: z.string().min(1, 'Selected text is required'),
  color: z.enum(['YELLOW', 'GREEN', 'BLUE', 'PINK']).default('YELLOW'),
  note: z.string().optional(),
});

export const updateHighlightSchema = z.object({
  highlightId: z.string().min(1, 'Highlight ID is required'),
  color: z.enum(['YELLOW', 'GREEN', 'BLUE', 'PINK']).optional(),
  note: z.string().optional(),
});
