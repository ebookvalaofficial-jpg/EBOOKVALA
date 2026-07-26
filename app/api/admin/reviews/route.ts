import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';

export async function GET() {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        book: { select: { id: true, title: true, coverImageUrl: true } },
      },
    });

    return NextResponse.json({ reviews });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, isHidden } = body;

    if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    const updatedReview = await prisma.review.update({
      where: { id },
      data: { isHidden: Boolean(isHidden) },
    });

    const actionName = isHidden ? 'REVIEW_HIDDEN' : 'REVIEW_RESTORED';

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: actionName,
      targetType: 'Review',
      targetId: id,
      details: { isHidden, rating: review.rating, commentSnippet: review.comment.slice(0, 50) },
    });

    return NextResponse.json({ review: updatedReview });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update review moderation' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Review ID required' }, { status: 400 });

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });

    await prisma.review.delete({ where: { id } });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'REVIEW_DELETED',
      targetType: 'Review',
      targetId: id,
      details: { rating: review.rating, commentSnippet: review.comment.slice(0, 50) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete review' }, { status: 500 });
  }
}
