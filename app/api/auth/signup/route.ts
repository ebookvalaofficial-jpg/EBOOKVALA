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

    // Generate password hash & unique referral code
    const hashedPassword = await bcrypt.hash(password, 10);
    const userReferralCode = `REF-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    // Check if referred by another user
    let referrerUserId: string | undefined = undefined;
    if (body.referralCode && typeof body.referralCode === 'string') {
      const referrer = await prisma.user.findUnique({
        where: { referralCode: body.referralCode.trim() },
        select: { id: true },
      });
      if (referrer) {
        referrerUserId = referrer.id;
      }
    }

    // Generate Verification Token (24-hour expiry)
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user and verification token in parallel transaction
    const [newUser] = await prisma.$transaction(async (tx) => {
      const createdUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          password: hashedPassword,
          provider: 'credentials',
          referralCode: userReferralCode,
          referredByUserId: referrerUserId,
        },
      });

      await tx.verificationToken.deleteMany({
        where: { identifier: normalizedEmail },
      });

      await tx.verificationToken.create({
        data: {
          identifier: normalizedEmail,
          token,
          expires,
        },
      });

      // Initial welcome XP bonus
      await tx.xpLog.create({
        data: { userId: createdUser.id, amount: 10, reason: 'Welcome Bonus: Signed up for EbookVala' },
      });
      await tx.coinLog.create({
        data: { userId: createdUser.id, amount: 1, reason: 'Welcome Bonus: Signed up for EbookVala' },
      });

      // Referral bonuses if applicable
      if (referrerUserId) {
        // Award Referrer
        await tx.xpLog.create({
          data: { userId: referrerUserId, amount: 50, reason: 'Referral Bonus: Friend joined EbookVala' },
        });
        await tx.coinLog.create({
          data: { userId: referrerUserId, amount: 5, reason: 'Referral Bonus: Friend joined EbookVala' },
        });

        // Award Referee
        await tx.xpLog.create({
          data: { userId: createdUser.id, amount: 50, reason: 'Referral Bonus: Used referral link' },
        });
        await tx.coinLog.create({
          data: { userId: createdUser.id, amount: 5, reason: 'Referral Bonus: Used referral link' },
        });
      }

      return [createdUser];
    });

    // Send verification email in non-blocking background task
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const demoVerificationUrl = `${baseUrl}/verify-email/${token}`;

    sendVerificationEmail(normalizedEmail, token).catch((err) => {
      console.error('[SIGNUP EMAIL ASYNC ERROR]:', err);
    });

    const intendedRole = body.intendedRole === 'author' ? 'author' : 'reader';
    const redirectTo = intendedRole === 'author' ? '/become-an-author/apply' : '/dashboard';

    return NextResponse.json(
      {
        success: true,
        message: 'Account created successfully! Please check your email to verify your account before logging in.',
        email: normalizedEmail,
        demoVerificationUrl,
        intendedRole,
        redirectTo,
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
