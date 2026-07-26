import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional().nullable(),
  image: z.string().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(6, 'Current password must be at least 6 characters'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const updateNotificationsSchema = z.object({
  emailNewReleases: z.boolean().default(true),
  emailReadingReminders: z.boolean().default(true),
  emailPromotions: z.boolean().default(false),
  emailOrderReceipts: z.boolean().default(true),
  pushEnabled: z.boolean().default(true),
});
