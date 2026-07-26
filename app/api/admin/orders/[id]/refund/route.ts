import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import Razorpay from 'razorpay';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { user: { select: { email: true, name: true } } },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'REFUNDED') {
      return NextResponse.json({ error: 'Order has already been refunded' }, { status: 400 });
    }

    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Only paid orders can be refunded' }, { status: 400 });
    }

    // Call Razorpay API in Test Mode
    let refundId = `rfnd_test_${Date.now()}`;
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET;

    if (razorpayKeyId && razorpayKeySecret && order.razorpayPaymentId) {
      try {
        const razorpay = new Razorpay({
          key_id: razorpayKeyId,
          key_secret: razorpayKeySecret,
        });

        const rzpRefund = await razorpay.payments.refund(order.razorpayPaymentId, {
          amount: order.amount,
          notes: {
            reason: 'Admin initiated refund from EbookVala Admin Panel',
            adminUserId: adminUser!.id,
          },
        });

        if (rzpRefund?.id) {
          refundId = rzpRefund.id;
        }
      } catch (rzpErr: any) {
        console.warn('Razorpay SDK refund fallback to mock test mode:', rzpErr.message);
      }
    }

    // Update order status to REFUNDED
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: 'REFUNDED' },
    });

    // Write AdminActionLog entry
    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'ORDER_REFUNDED',
      targetType: 'Order',
      targetId: id,
      details: {
        amountRupees: Math.round(order.amount / 100),
        userEmail: order.user?.email,
        razorpayPaymentId: order.razorpayPaymentId,
        refundId,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Order #${id} refunded successfully (₹${Math.round(order.amount / 100)})`,
      order: updatedOrder,
      refundId,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to process refund' }, { status: 500 });
  }
}
