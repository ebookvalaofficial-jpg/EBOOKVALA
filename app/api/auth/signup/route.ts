import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validations/auth';
import { sendVerificationEmail } from '@/lib/email';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = checkRateLimit(`signup_${ip}`, 5, 60 * 1000);
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too many signup attempts. Please wait a minute before trying again.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = signupSchema.safeParse(body);

    if (!result.success) {
      const issue = result.error.issues[0]?.message || 'Invalid input data';
      return NextResponse.json({ error: issue }, { status: 400 });
    }

    const { name, email, password } = result.data;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, password: true },
    });

    if (existingUser) {
      if (!existingUser.password) {
        return NextResponse.json(
          { error: 'An account with this email was registered using Google. Please log in with Google.' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'An account with this email address already exists. Please log in instead.' },
        { status: 400 }
      );
    }

    // Hash password with bcrypt (10 rounds: industry standard secure & fast)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate Verification Token (24-hour expiry)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user and verification token in parallel transaction
    await prisma.$transaction([
      prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          provider: 'credentials',
        },
      }),
      prisma.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      }),
      prisma.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires,
        },
      }),
    ]);

    // Send verification email in non-blocking background task
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const demoVerificationUrl = `${baseUrl}/verify-email/${token}`;

    sendVerificationEmail(normalizedEmail, token).catch((err) => {
      console.error('[SIGNUP EMAIL ASYNC ERROR]:', err);
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account before logging in.',
        email: normalizedEmail,
        demoVerificationUrl,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('[SIGNUP API ERROR]:', error);
    return NextResponse.json(
      { error: 'An internal server error occurred while creating your account. Please try again.' },
      { status: 500 }
    );
  }
}
