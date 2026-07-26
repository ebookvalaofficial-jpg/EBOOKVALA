import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bookSubmissionSchema } from '@/lib/validations/author';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.isAuthor) return NextResponse.json({ error: 'Author access required' }, { status: 403 });

    const submission = await prisma.authorBookSubmission.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!submission || submission.authorUserId !== user.id) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json({
      submission: {
        ...submission,
        manuscriptChapters: JSON.parse(submission.manuscriptChapters || '[]'),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch submission' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.isAuthor) return NextResponse.json({ error: 'Author access required' }, { status: 403 });

    const submission = await prisma.authorBookSubmission.findUnique({ where: { id } });
    if (!submission || submission.authorUserId !== user.id) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (['APPROVED', 'PUBLISHED'].includes(submission.status)) {
      return NextResponse.json({ error: 'Cannot edit an approved/published submission' }, { status: 400 });
    }

    const body = await req.json();
    const { isSubmitForReview, ...submissionData } = body;
    const validated = bookSubmissionSchema.parse(submissionData);

    const updated = await prisma.authorBookSubmission.update({
      where: { id },
      data: {
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        coverImageUrl: validated.coverImageUrl,
        price: validated.price,
        manuscriptChapters: JSON.stringify(validated.manuscriptChapters),
        status: isSubmitForReview ? 'SUBMITTED' : 'DRAFT',
        submittedAt: isSubmitForReview ? new Date() : submission.submittedAt,
        rejectionReason: isSubmitForReview ? null : submission.rejectionReason,
      },
    });

    return NextResponse.json({ submission: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update submission' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user || !user.isAuthor) return NextResponse.json({ error: 'Author access required' }, { status: 403 });

    const submission = await prisma.authorBookSubmission.findUnique({ where: { id } });
    if (!submission || submission.authorUserId !== user.id) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    if (submission.status !== 'DRAFT' && submission.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Only DRAFT or REJECTED submissions can be deleted' }, { status: 400 });
    }

    await prisma.authorBookSubmission.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete submission' }, { status: 500 });
  }
}
