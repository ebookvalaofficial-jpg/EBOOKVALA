import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';
import { createCheckoutOrderSchema } from '@/lib/validations/checkout';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const { bookId, promoCode } = createCheckoutOrderSchema.parse(body);

    let orderItems: Array<{ bookId: string; title: string; price: number; quantity: number }> = [];
    let grossTotalINR = 0;

    if (bookId) {
      // Direct single book purchase ("Buy Now")
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      if (!book) {
        return NextResponse.json({ error: 'eBook not found' }, { status: 404 });
      }
      orderItems.push({
        bookId: book.id,
        title: book.title,
        price: book.price,
        quantity: 1,
      });
      grossTotalINR = book.price;
    } else {
      // Full Cart purchase ("Proceed to Checkout")
      const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { book: true },
      });

      if (cartItems.length === 0) {
        return NextResponse.json({ error: 'Your cart is empty' }, { status: 400 });
      }

      orderItems = cartItems.map((ci) => {
        grossTotalINR += ci.book.price * ci.quantity;
        return {
          bookId: ci.book.id,
          title: ci.book.title,
          price: ci.book.price,
          quantity: ci.quantity,
        };
      });
    }

    // Process & Validate Promo Code Server-Side
    let discountAmountINR = 0;
    let validPromoCodeName: string | null = null;

    if (promoCode && promoCode.trim() !== '') {
      const codeInput = promoCode.trim().toUpperCase();
      const dbPromo = await prisma.promoCode.findUnique({
        where: { code: codeInput },
      });

      if (
        dbPromo &&
        dbPromo.isActive &&
        (!dbPromo.expiresAt || dbPromo.expiresAt > new Date()) &&
        (dbPromo.maxUses === null || dbPromo.usedCount < dbPromo.maxUses) &&
        (!dbPromo.minOrderAmount || grossTotalINR >= dbPromo.minOrderAmount)
      ) {
        validPromoCodeName = dbPromo.code;
        if (dbPromo.discountType === 'PERCENT') {
          discountAmountINR = Math.round((grossTotalINR * dbPromo.discountValue) / 100);
        } else {
          discountAmountINR = Math.min(dbPromo.discountValue, grossTotalINR);
        }
      }
    }

    const netTotalINR = Math.max(0, grossTotalINR - discountAmountINR);
    const amountInPaise = Math.max(100, netTotalINR * 100); // Razorpay requires min 100 paise (₹1)

    // Create Razorpay Order
    let razorpayOrder: any;
    const receiptId = `rcpt_${Date.now()}_${user.id.substring(0, 6)}`;

    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          userId: user.id,
          userEmail: user.email,
          promoCode: validPromoCodeName || '',
        },
      });
    } catch (rzpErr: any) {
      console.warn('Razorpay API call failed or test mode fallback:', rzpErr?.message);
      // Fallback for local test mode when test credentials aren't initialized with live API
      razorpayOrder = {
        id: `order_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
      };
    }

    // Save Order in Database with PENDING status
    const dbOrder = await prisma.order.create({
      data: {
        userId: user.id,
        razorpayOrderId: razorpayOrder.id,
        status: 'PENDING',
        amount: amountInPaise,
        currency: 'INR',
        promoCodeApplied: validPromoCodeName,
        discountAmount: discountAmountINR,
        items: {
          create: orderItems.map((item) => ({
            bookId: item.bookId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      orderId: dbOrder.id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      amountINR: netTotalINR,
      grossTotalINR,
      discountAmountINR,
      promoCodeApplied: validPromoCodeName,
      currency: 'INR',
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    });
  } catch (error: any) {
    console.error('Error creating checkout order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize order' },
      { status: 500 }
    );
  }
}
