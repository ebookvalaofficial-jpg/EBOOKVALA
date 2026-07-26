import { z } from 'zod';

export const authorApplicationSchema = z.object({
  penName: z.string().min(2, 'Pen name must be at least 2 characters'),
  bio: z.string().min(20, 'Bio must be at least 20 characters'),
  sampleWorkUrl: z.string().url('Invalid sample work URL').or(z.literal('')).optional(),
  sampleWorkText: z.string().min(50, 'Sample text must be at least 50 characters').or(z.literal('')).optional(),
  socialLinks: z
    .object({
      website: z.string().optional(),
      twitter: z.string().optional(),
      instagram: z.string().optional(),
    })
    .optional(),
});

export const bookSubmissionSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  categoryId: z.string().min(1, 'Category is required'),
  coverImageUrl: z.string().min(1, 'Cover image URL is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  manuscriptChapters: z.array(
    z.object({
      title: z.string().min(1, 'Chapter title required'),
      content: z.string().min(10, 'Chapter content required'),
    })
  ).min(1, 'At least 1 chapter is required'),
});

export const payoutRequestSchema = z.object({
  amount: z.number().min(500, 'Minimum payout request threshold is ₹500'),
});
