import { z } from 'zod';

export const aiChatSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapterId: z.string().optional().nullable(),
  prompt: z.string().min(1, 'Prompt cannot be empty'),
});

export const aiSummarySchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapterId: z.string().optional().nullable(),
});

export const aiFlashcardsSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapterId: z.string().optional().nullable(),
});

export const aiQuizSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapterId: z.string().optional().nullable(),
});

export const aiQuizSubmitSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  score: z.number().min(0),
  totalQuestions: z.number().min(1),
});

export const aiTranslateSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapterId: z.string().optional().nullable(),
  textSnippet: z.string().min(1, 'Text snippet required'),
  targetLanguage: z.string().min(2, 'Target language required'),
});

export const aiNarrateSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  chapterId: z.string().optional().nullable(),
  textSnippet: z.string().min(1, 'Text snippet required'),
});
