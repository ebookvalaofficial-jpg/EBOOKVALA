import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { bookSubmissionSchema } from '@/lib/validations/author';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.isAuthor) {
      return NextResponse.json({ error: 'Author access required' }, { status: 403 });
    }

    const submissions = await prisma.authorBookSubmission.findMany({
      where: { authorUserId: user.id },
      include: { category: true },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch book submissions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || !user.isAuthor) {
      return NextResponse.json({ error: 'Author access required' }, { status: 403 });
    }

    const body = await req.json();
    const { isSubmitForReview, ...submissionData } = body;
    const validated = bookSubmissionSchema.parse(submissionData);

    const submission = await prisma.authorBookSubmission.create({
      data: {
        authorUserId: user.id,
        title: validated.title,
        description: validated.description,
        categoryId: validated.categoryId,
        coverImageUrl: validated.coverImageUrl,
        price: validated.price,
        manuscriptChapters: JSON.stringify(validated.manuscriptChapters),
        status: isSubmitForReview ? 'SUBMITTED' : 'DRAFT',
        submittedAt: isSubmitForReview ? new Date() : null,
      },
    });

    return NextResponse.json({ submission });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create submission' }, { status: 500 });
  }
}
