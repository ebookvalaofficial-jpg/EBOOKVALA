import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import {
  updateProfileSchema,
  changePasswordSchema,
  updateNotificationsSchema,
} from '@/lib/validations/profile';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        notificationPreference: true,
        accounts: { select: { provider: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const connectedAccounts = user.accounts.map((a) => a.provider);
    if (user.provider && !connectedAccounts.includes(user.provider)) {
      connectedAccounts.push(user.provider);
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        bio: user.bio,
        provider: user.provider || 'credentials',
        connectedAccounts,
        hasPassword: Boolean(user.password),
        createdAt: user.createdAt.toISOString(),
      },
      notifications: user.notificationPreference || {
        emailNewReleases: true,
        emailReadingReminders: true,
        emailPromotions: false,
        emailOrderReceipts: true,
        pushEnabled: true,
      },
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await req.json();

    // 1. Password Change Action
    if (body.action === 'change-password') {
      if (user.provider === 'google' && !user.password) {
        return NextResponse.json(
          { error: 'Password change is disabled for Google OAuth single sign-on accounts.' },
          { status: 400 }
        );
      }

      const { currentPassword, newPassword } = changePasswordSchema.parse(body);

      if (user.password) {
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
          return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedNewPassword },
      });

      return NextResponse.json({ message: 'Password updated successfully' });
    }

    // 2. Notification Preferences Action
    if (body.notifications) {
      const parsedNotifs = updateNotificationsSchema.parse(body.notifications);
      const updatedNotifs = await prisma.notificationPreference.upsert({
        where: { userId: user.id },
        update: parsedNotifs,
        create: {
          userId: user.id,
          ...parsedNotifs,
        },
      });

      return NextResponse.json({
        message: 'Notification preferences updated',
        notifications: updatedNotifs,
      });
    }

    // 3. Profile Information Action
    const { name, bio, image } = updateProfileSchema.parse(body);
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        bio,
        image: image !== undefined ? image : user.image,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image,
        bio: updatedUser.bio,
      },
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: error?.message || 'Failed to update profile' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Perform safe user deletion (cascades to user-owned relations)
    await prisma.user.delete({
      where: { id: user.id },
    });

    return NextResponse.json({ message: 'Account deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting user account:', error);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
