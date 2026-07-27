import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { submissionId } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: 'Submission ID is required.' }, { status: 400 });
    }

    // Verify submission belongs to author
    const submission = await prisma.authorBookSubmission.findUnique({
      where: { id: submissionId },
    });

    if (!submission || submission.authorUserId !== session.user.id) {
      return NextResponse.json({ error: 'Book submission not found or forbidden.' }, { status: 403 });
    }

    // Generate unguessable 32-char token & 30-day expiration
    const token = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const previewLink = await prisma.authorPreviewLink.create({
      data: {
        bookSubmissionId: submissionId,
        token,
        expiresAt,
      },
    });

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const previewUrl = `${baseUrl}/author/preview/${token}`;

    return NextResponse.json({
      success: true,
      token,
      previewUrl,
    });
  } catch (error) {
    console.error('[GENERATE PREVIEW LINK ERROR]:', error);
    return NextResponse.json({ error: 'Failed to generate preview link' }, { status: 500 });
  }
}
