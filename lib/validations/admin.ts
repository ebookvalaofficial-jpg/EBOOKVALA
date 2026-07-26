import { z } from 'zod';

export const adminBookSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  slug: z.string().min(2, 'Slug is required'),
  authorId: z.string().min(1, 'Author is required'),
  categoryId: z.string().min(1, 'Category is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.number().min(0, 'Price must be non-negative'),
  originalPrice: z.number().optional().nullable(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
  coverImageUrl: z.string().min(1, 'Cover image URL is required'),
  pageCount: z.number().min(1).default(200),
  language: z.string().default('English'),
  format: z.string().default('EPUB, PDF'),
  isBestseller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  chapters: z
    .array(
      z.object({
        id: z.string().optional(),
        order: z.number(),
        title: z.string().min(1, 'Chapter title required'),
        content: z.string().min(1, 'Chapter content required'),
      })
    )
    .optional(),
});

export const adminAuthorSchema = z.object({
  name: z.string().min(2, 'Author name is required'),
  slug: z.string().min(2, 'Slug is required'),
  bio: z.string().optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
});

export const adminCategorySchema = z.object({
  name: z.string().min(2, 'Category name is required'),
  slug: z.string().min(2, 'Slug is required'),
  icon: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

export const adminPromoCodeSchema = z.object({
  code: z.string().min(3, 'Promo code must be at least 3 characters'),
  discountType: z.enum(['PERCENT', 'FLAT']).default('PERCENT'),
  discountValue: z.number().min(1, 'Discount value must be at least 1'),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxUses: z.number().min(1).optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const adminUserRoleSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
});
