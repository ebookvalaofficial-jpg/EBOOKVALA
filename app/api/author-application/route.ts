import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { authorApplicationSchema } from '@/lib/validations/author';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        authorApplications: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const latestApp = user.authorApplications[0] || null;

    return NextResponse.json({
      isAuthor: user.isAuthor,
      applicationStatus: user.authorApplicationStatus,
      application: latestApp,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch application status' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const validated = authorApplicationSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (user.isAuthor) {
      return NextResponse.json({ error: 'You are already an approved author!' }, { status: 400 });
    }

    const application = await prisma.authorApplication.create({
      data: {
        userId: user.id,
        penName: validated.penName,
        bio: validated.bio,
        sampleWorkUrl: validated.sampleWorkUrl || null,
        sampleWorkText: validated.sampleWorkText || null,
        socialLinks: validated.socialLinks ? JSON.stringify(validated.socialLinks) : null,
        status: 'PENDING',
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { authorApplicationStatus: 'PENDING' },
    });

    return NextResponse.json({ application });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to submit application' }, { status: 500 });
  }
}
