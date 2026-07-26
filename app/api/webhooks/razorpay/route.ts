import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature') || '';
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';

    // Verify webhook signature (skip only if secret not set in test dev environment)
    if (webhookSecret && signature) {
      const isValid = verifyWebhookSignature({
        bodyText: rawBody,
        signature,
        webhookSecret,
      });

      if (!isValid) {
        console.error('Invalid Razorpay Webhook Signature!');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const entity = payload.payload?.payment?.entity || payload.payload?.subscription?.entity || {};

    console.log(`🔔 Razorpay Webhook Event Received: ${event}`);

    switch (event) {
      case 'payment.captured': {
        const razorpayOrderId = entity.order_id;
        const razorpayPaymentId = entity.id;

        if (razorpayOrderId) {
          const order = await prisma.order.findUnique({
            where: { razorpayOrderId },
            include: { items: true },
          });

          if (order && order.status !== 'PAID') {
            await prisma.order.update({
              where: { id: order.id },
              data: {
                status: 'PAID',
                razorpayPaymentId,
              },
            });

            // Create Purchase Ownership Records
            for (const item of order.items) {
              if (item.bookId) {
                await prisma.purchase.upsert({
                  where: {
                    userId_bookId: {
                      userId: order.userId,
                      bookId: item.bookId,
                    },
                  },
                  update: { orderId: order.id },
                  create: {
                    userId: order.userId,
                    bookId: item.bookId,
                    orderId: order.id,
                  },
                });
              }
            }

            // Clear User Cart
            await prisma.cartItem.deleteMany({
              where: { userId: order.userId },
            });
          }
        }
        break;
      }

      case 'payment.failed': {
        const razorpayOrderId = entity.order_id;
        if (razorpayOrderId) {
          await prisma.order.updateMany({
            where: { razorpayOrderId },
            data: { status: 'FAILED' },
          });
        }
        break;
      }

      case 'subscription.activated':
      case 'subscription.charged': {
        const rzpSubId = entity.id;
        const notes = entity.notes || {};
        const userId = notes.userId;
        const plan = notes.plan || 'PLUS';

        if (userId) {
          const nextPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
          await prisma.subscription.upsert({
            where: { userId },
            update: {
              plan,
              status: 'ACTIVE',
              razorpaySubscriptionId: rzpSubId,
              currentPeriodEnd: nextPeriodEnd,
              cancelAtPeriodEnd: false,
            },
            create: {
              userId,
              plan,
              status: 'ACTIVE',
              razorpaySubscriptionId: rzpSubId,
              currentPeriodEnd: nextPeriodEnd,
            },
          });
        }
        break;
      }

      case 'subscription.cancelled': {
        const rzpSubId = entity.id;
        if (rzpSubId) {
          await prisma.subscription.updateMany({
            where: { razorpaySubscriptionId: rzpSubId },
            data: {
              status: 'CANCELLED',
              cancelAtPeriodEnd: true,
            },
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error handling Razorpay webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing error' },
      { status: 500 }
    );
  }
}
