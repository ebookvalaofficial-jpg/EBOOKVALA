import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await prisma.siteSetting.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      settings = await prisma.siteSetting.create({
        data: {
          id: 'default',
          siteName: 'EbookVala',
          supportEmail: 'support@ebookvala.com',
          maintenanceMode: false,
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching admin site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user?.role !== 'ADMIN' && session.user?.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { siteName, supportEmail, maintenanceMode, twitterUrl, facebookUrl, instagramUrl, linkedinUrl } = body;

    const updated = await prisma.siteSetting.upsert({
      where: { id: 'default' },
      update: {
        siteName,
        supportEmail,
        maintenanceMode: Boolean(maintenanceMode),
        twitterUrl,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
      },
      create: {
        id: 'default',
        siteName: siteName || 'EbookVala',
        supportEmail: supportEmail || 'support@ebookvala.com',
        maintenanceMode: Boolean(maintenanceMode),
        twitterUrl,
        facebookUrl,
        instagramUrl,
        linkedinUrl,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
