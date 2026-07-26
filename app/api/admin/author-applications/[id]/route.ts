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
    const { action, reviewNote } = body; // action: 'APPROVE' or 'REJECT'

    if (!['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }

    const application = await prisma.authorApplication.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Author application not found' }, { status: 404 });
    }

    const isApproved = action === 'APPROVE';
    const newStatus = isApproved ? 'APPROVED' : 'REJECTED';

    const updatedApp = await prisma.authorApplication.update({
      where: { id },
      data: {
        status: newStatus,
        reviewedByAdminId: adminUser.id,
        reviewNote: reviewNote || null,
        reviewedAt: new Date(),
      },
    });

    if (isApproved) {
      // 1. Update User to isAuthor = true
      await prisma.user.update({
        where: { id: application.userId },
        data: {
          isAuthor: true,
          authorApplicationStatus: 'APPROVED',
        },
      });

      // 2. Create or link Author profile record
      const authorSlug = application.penName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingAuthor = await prisma.author.findFirst({
        where: { OR: [{ userId: application.userId }, { slug: authorSlug }] },
      });

      if (!existingAuthor) {
        await prisma.author.create({
          data: {
            name: application.penName,
            slug: authorSlug,
            bio: application.bio,
            avatarUrl: application.user.image || '/team/prince-gajera.jpg',
            userId: application.userId,
          },
        });
      } else if (!existingAuthor.userId) {
        await prisma.author.update({
          where: { id: existingAuthor.id },
          data: { userId: application.userId },
        });
      }
    } else {
      await prisma.user.update({
        where: { id: application.userId },
        data: { authorApplicationStatus: 'REJECTED' },
      });
    }

    await logAdminAction({
      adminUserId: adminUser.id,
      action: isApproved ? 'AUTHOR_APPLICATION_APPROVED' : 'AUTHOR_APPLICATION_REJECTED',
      targetType: 'AuthorApplication',
      targetId: application.id,
      details: { applicantEmail: application.user.email, penName: application.penName, reviewNote },
    });

    return NextResponse.json({ application: updatedApp });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to review application' }, { status: 500 });
  }
}
