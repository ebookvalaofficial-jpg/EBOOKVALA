import { z } from 'zod';

export const bookQuerySchema = z.object({
  category: z.string().optional(),
  author: z.string().optional(),
  priceMin: z.coerce.number().optional(),
  priceMax: z.coerce.number().optional(),
  ratingMin: z.coerce.number().optional(),
  language: z.string().optional(),
  format: z.string().optional(),
  sort: z.enum(['popular', 'newest', 'price_asc', 'price_desc', 'rating_desc']).optional().default('popular'),
  search: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  limit: z.coerce.number().optional().default(12),
  isBestseller: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isTrending: z.coerce.boolean().optional(),
});

export const createReviewSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  rating: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
  comment: z.string().min(5, 'Review comment must be at least 5 characters long'),
});

export const updateReviewSchema = createReviewSchema.partial();

export const wishlistToggleSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
});

export const cartItemSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  quantity: z.number().int().min(1).default(1),
});

export const updateCartItemSchema = z.object({
  bookId: z.string().min(1, 'Book ID is required'),
  quantity: z.number().int().min(0),
});
