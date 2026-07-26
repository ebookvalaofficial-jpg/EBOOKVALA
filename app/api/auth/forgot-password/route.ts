import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { sendPasswordResetEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`forgot_password_${ip}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many password reset requests. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = forgotPasswordSchema.safeParse(body);

    if (!result.success) {
      const issue = result.error.issues[0]?.message || 'Please enter a valid email address';
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const normalizedEmail = result.data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let demoResetUrl: string | undefined;

    // Only generate reset token if user exists and has a password
    if (user && user.password) {
      await prisma.passwordResetToken.deleteMany({
        where: { email: normalizedEmail },
      });

      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.passwordResetToken.create({
        data: {
          email: normalizedEmail,
          token,
          expires,
        },
      });

      const emailResult = await sendPasswordResetEmail(normalizedEmail, token);
      demoResetUrl = emailResult.url;
    }

    // Always return neutral message for security
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email address, a password reset link has been sent. Check your inbox or server logs.',
      demoResetUrl,
    });
  } catch (error: unknown) {
    console.error('[FORGOT PASSWORD API ERROR]:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
