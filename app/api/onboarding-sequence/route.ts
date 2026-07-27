import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendRawEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stage } = await req.json(); // "day0" | "day2" | "day4"

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, name: true, createdAt: true },
    });

    if (!user || !user.email) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userName = user.name || 'Reader';

    if (stage === 'day0' || !stage) {
      // Day 0: Welcome to EbookVala
      await sendRawEmail(
        user.email,
        `Welcome to EbookVala, ${userName}! 📚 Here is your reading roadmap`,
        `<div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff;">
          <h1 style="color: #2563eb; font-size: 22px;">Welcome to EbookVala! 🎉</h1>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">Hi ${userName},</p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">We are thrilled to welcome you to Next-Gen eBook Reading & AI Knowledge Platform.</p>
          <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <h3 style="margin: 0 0 8px 0; font-size: 15px; color: #1e293b;">⚡ Top Recommended Next Read</h3>
            <p style="margin: 0; font-size: 13px; color: #475569;">Check out <strong>Mastering Full-Stack AI Apps</strong> in our store to kickstart your journey!</p>
          </div>
          <a href="https://ebookvala.com/books" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px;">Browse Digital Store →</a>
        </div>`
      );
    } else if (stage === 'day2') {
      // Day 2: Getting the most out of EbookVala
      await sendRawEmail(
        user.email,
        `Unlock Superpowers with AI Chat & Reading Goals 🚀`,
        `<div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #4f46e5; font-size: 20px;">Did you know you can chat with any eBook? 🤖</h2>
          <p style="font-size: 14px; line-height: 1.6;">Hi ${userName}, highlight any text or open AI Chat inside the eBook reader to get instant 10-minute summaries, flashcard quizzes, and deep context explanations!</p>
          <ul style="font-size: 13px; line-height: 1.8; color: #334155;">
            <li>🔥 Keep your daily reading streak alive</li>
            <li>📝 Export annotated notes to Markdown & PDF</li>
            <li>🏆 Compete on the global Reader Leaderboard</li>
          </ul>
          <a href="https://ebookvala.com/dashboard" style="display: inline-block; padding: 12px 24px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px;">Open Reader Dashboard →</a>
        </div>`
      );
    } else if (stage === 'day4') {
      // Day 4: Bonus XP Nudge
      await sendRawEmail(
        user.email,
        `Claim your Bonus XP: Complete your Reading Profile 🌟`,
        `<div style="font-family: Arial, sans-serif; padding: 24px; color: #0f172a; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px;">
          <h2 style="color: #d97706; font-size: 20px;">Earn +50 Bonus XP Today! 🪙</h2>
          <p style="font-size: 14px; line-height: 1.6;">Complete your Reading Interests in Profile Settings to personalize your eBook recommendations and claim bonus XP.</p>
          <a href="https://ebookvala.com/dashboard/profile" style="display: inline-block; padding: 12px 24px; background: #d97706; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 13px;">Update Profile Now →</a>
        </div>`
      );
    }

    return NextResponse.json({
      success: true,
      message: `Onboarding email (${stage || 'day0'}) triggered for ${user.email}`,
    });
  } catch (error) {
    console.error('[ONBOARDING EMAIL SEQUENCE ERROR]:', error);
    return NextResponse.json({ error: 'Failed to trigger onboarding email' }, { status: 500 });
  }
}
