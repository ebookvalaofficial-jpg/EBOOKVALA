import { NextResponse } from 'next/server';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse || !adminUser) return errorResponse;

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, rejectionReason } = body; // action: 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }

    if (action === 'REJECT' && !rejectionReason?.trim()) {
      return NextResponse.json({ error: 'Rejection reason is required when rejecting a submission' }, { status: 400 });
    }

    const submission = await prisma.authorBookSubmission.findUnique({
      where: { id },
      include: { authorUser: { include: { authorProfile: true } } },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Book submission not found' }, { status: 404 });
    }

    if (action === 'REJECT') {
      const rejectedSubmission = await prisma.authorBookSubmission.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason,
          reviewedAt: new Date(),
        },
      });

      await logAdminAction({
        adminUserId: adminUser.id,
        action: 'BOOK_SUBMISSION_REJECTED',
        targetType: 'AuthorBookSubmission',
        targetId: submission.id,
        details: { title: submission.title, rejectionReason },
      });

      return NextResponse.json({ submission: rejectedSubmission });
    }

    // APPROVE & PUBLISH FLOW
    // 1. Get or create Author profile for the author user
    let authorProfile = submission.authorUser.authorProfile;
    if (!authorProfile) {
      const slug = (submission.authorUser.name || 'Author').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      authorProfile = await prisma.author.create({
        data: {
          name: submission.authorUser.name || 'Marketplace Author',
          slug: `${slug}-${Date.now().toString().slice(-4)}`,
          bio: submission.authorUser.bio || 'Marketplace eBook Author',
          avatarUrl: submission.authorUser.image || '/team/prince-gajera.jpg',
          userId: submission.authorUserId,
        },
      });
    }

    // 2. Generate unique Book slug
    const baseSlug = submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const bookSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // 3. Parse manuscript chapters
    const chapters: Array<{ title: string; content: string }> = JSON.parse(
      submission.manuscriptChapters || '[]'
    );

    // 4. Create live Book record
    const createdBook = await prisma.book.create({
      data: {
        title: submission.title,
        slug: bookSlug,
        authorId: authorProfile.id,
        description: submission.description,
        coverImageUrl: submission.coverImageUrl,
        categoryId: submission.categoryId,
        price: submission.price,
        originalPrice: Math.round(submission.price * 1.5),
        discountPercent: 33,
        pageCount: Math.max(50, chapters.length * 15),
        language: 'English',
        format: 'EPUB, PDF',
        chapters: {
          create: chapters.map((ch, idx) => ({
            order: idx + 1,
            title: ch.title,
            content: ch.content,
            wordCount: ch.content.split(/\s+/).length,
          })),
        },
      },
    });

    // 5. Update submission status to PUBLISHED & link bookId
    const updatedSubmission = await prisma.authorBookSubmission.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        bookId: createdBook.id,
        reviewedAt: new Date(),
      },
    });

    // 6. Update Author booksCount
    await prisma.author.update({
      where: { id: authorProfile.id },
      data: { booksCount: { increment: 1 } },
    });

    await logAdminAction({
      adminUserId: adminUser.id,
      action: 'BOOK_SUBMISSION_APPROVED_AND_PUBLISHED',
      targetType: 'AuthorBookSubmission',
      targetId: submission.id,
      details: { title: submission.title, bookId: createdBook.id, bookSlug: createdBook.slug },
    });

    return NextResponse.json({
      submission: updatedSubmission,
      book: createdBook,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to review book submission' }, { status: 500 });
  }
}
