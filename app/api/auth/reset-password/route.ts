import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ valid: false, error: 'Token query parameter missing.' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false, error: 'Password reset link is invalid or has already been used.' }, { status: 400 });
    }

    if (new Date() > resetToken.expires) {
      return NextResponse.json({ valid: false, error: 'Password reset link has expired. Please request a new one.' }, { status: 400 });
    }

    return NextResponse.json({ valid: true });
  } catch (error: unknown) {
    console.error('[RESET PASSWORD VERIFY TOKEN API ERROR]:', error);
    return NextResponse.json({ valid: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`reset_password_${ip}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }

    const validation = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!validation.success) {
      const issue = validation.error.issues[0]?.message || 'Invalid password payload';
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetTokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset link. Please request a new reset link.' },
        { status: 400 }
      );
    }

    if (new Date() > resetTokenRecord.expires) {
      return NextResponse.json(
        { error: 'Password reset link has expired. Please request a new reset link.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await prisma.user.update({
      where: { email: resetTokenRecord.email },
      data: { password: hashedPassword },
    });

    // Delete single-use reset token
    await prisma.passwordResetToken.delete({
      where: { token },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (error: unknown) {
    console.error('[RESET PASSWORD POST API ERROR]:', error);
    return NextResponse.json(
      { error: 'An internal error occurred while resetting your password. Please try again.' },
      { status: 500 }
    );
  }
}
