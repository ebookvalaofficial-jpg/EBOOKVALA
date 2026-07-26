import { z } from 'zod';

export const createCheckoutOrderSchema = z.object({
  bookId: z.string().optional(), // If purchasing a single book directly
  promoCode: z.string().optional(), // Optional promo code
});

export const verifyPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, 'Razorpay order ID is required'),
  razorpayPaymentId: z.string().min(1, 'Razorpay payment ID is required'),
  razorpaySignature: z.string().min(1, 'Razorpay signature is required'),
});

export const validatePromoCodeSchema = z.object({
  code: z.string().min(1, 'Promo code is required'),
  orderAmount: z.number().min(0),
});

export const createSubscriptionSchema = z.object({
  plan: z.enum(['STARTER', 'READER', 'PLUS', 'PRO']),
});

export const cancelSubscriptionSchema = z.object({
  subscriptionId: z.string().optional(),
});
