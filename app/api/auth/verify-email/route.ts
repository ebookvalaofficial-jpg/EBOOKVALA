import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, action, email } = body;

    // Resend action handling
    if (action === 'resend') {
      if (!email) {
        return NextResponse.json({ error: 'Email address is required to resend verification.' }, { status: 400 });
      }

      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        return NextResponse.json({ error: 'No account found with this email address.' }, { status: 404 });
      }

      if (user.emailVerified) {
        return NextResponse.json({ success: true, message: 'Your email is already verified. Please log in.' });
      }

      await prisma.verificationToken.deleteMany({
        where: { identifier: user.email },
      });

      const newToken = crypto.randomUUID();
      const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      await prisma.verificationToken.create({
        data: {
          identifier: user.email,
          token: newToken,
          expires,
        },
      });

      const emailResult = await sendVerificationEmail(user.email, newToken);

      return NextResponse.json({
        success: true,
        message: 'A new verification email has been sent! Check your inbox or terminal logs.',
        demoVerificationUrl: emailResult.url,
      });
    }

    // Verify token handling
    if (!token) {
      return NextResponse.json({ error: 'Verification token is required.' }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Invalid verification token. It may have already been used or deleted.' },
        { status: 400 }
      );
    }

    if (new Date() > verificationToken.expires) {
      return NextResponse.json(
        {
          error: 'Verification token has expired. Please request a new verification email.',
          canResend: true,
          email: verificationToken.identifier,
        },
        { status: 400 }
      );
    }

    // Update user status
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Delete token
    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: 'Your email address has been verified successfully! You may now sign in.',
    });
  } catch (error: unknown) {
    console.error('[VERIFY EMAIL API ERROR]:', error);
    return NextResponse.json(
      { error: 'An error occurred while verifying your email. Please try again.' },
      { status: 500 }
    );
  }
}
