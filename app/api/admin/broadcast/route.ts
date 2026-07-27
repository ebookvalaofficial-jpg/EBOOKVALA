import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendRawEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ADMIN role
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, id: true },
    });

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Rate limit: Max 3 broadcasts per hour
    const rateLimit = checkRateLimit(`broadcast_${adminUser.id}`, 3, 60 * 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Broadcast rate limit reached (max 3 per hour). Please wait before broadcasting again.' },
        { status: 429 }
      );
    }

    const { subject, body, segment } = await req.json();

    if (!subject || !subject.trim() || !body || !body.trim()) {
      return NextResponse.json({ error: 'Subject and body content are required.' }, { status: 400 });
    }

    // Query target users according to segment
    let whereClause: any = { isBanned: false };
    if (segment === 'AUTHORS') {
      whereClause.isAuthor = true;
    } else if (segment === 'PLUS') {
      whereClause.subscriptions = { some: { status: 'ACTIVE', plan: { not: 'FREE' } } };
    } else if (segment === 'FREE') {
      whereClause.subscriptions = { none: { status: 'ACTIVE', plan: { not: 'FREE' } } };
    }

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { email: true },
    });

    const recipientCount = targetUsers.length;

    // Async batch email dispatch (fire-and-forget for client speed, up to 100 emails log)
    const emailList = targetUsers.map((u) => u.email).filter(Boolean);

    // Send async
    Promise.allSettled(
      emailList.slice(0, 200).map((toEmail) =>
        sendRawEmail(
          toEmail,
          subject.trim(),
          `<div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb; font-size: 20px;">EbookVala Announcement</h2>
            <div style="font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin-top: 15px;">${body.trim()}</div>
            <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e2e8f0;" />
            <p style="font-size: 11px; color: #64748b; margin-top: 10px;">You are receiving this message as an account holder on EbookVala.</p>
          </div>`
        )
      )
    ).catch((err) => console.error('[BROADCAST EMAIL ERROR]:', err));

    // Log to EmailBroadcast model
    const broadcastRecord = await prisma.emailBroadcast.create({
      data: {
        subject: subject.trim(),
        body: body.trim(),
        segment: segment || 'ALL',
        recipientCount,
        sentByAdminId: adminUser.id,
      },
    });

    // Also log in AdminActionLog
    await prisma.adminActionLog.create({
      data: {
        adminUserId: adminUser.id,
        action: 'EMAIL_BROADCAST_SENT',
        targetType: 'EMAIL_BROADCAST',
        targetId: broadcastRecord.id,
        details: `Sent "${subject}" to ${recipientCount} users in segment "${segment}"`,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Broadcast successfully sent to ${recipientCount} matching user(s).`,
      broadcast: broadcastRecord,
    });
  } catch (error) {
    console.error('[ADMIN BROADCAST API ERROR]:', error);
    return NextResponse.json({ error: 'Failed to send broadcast email.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const broadcasts = await prisma.emailBroadcast.findMany({
      orderBy: { sentAt: 'desc' },
      take: 20,
      include: {
        sentByAdmin: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json({ broadcasts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch broadcast logs' }, { status: 500 });
  }
}
