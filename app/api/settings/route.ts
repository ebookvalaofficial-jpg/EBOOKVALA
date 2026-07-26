import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
          twitterUrl: 'https://twitter.com/ebookvala',
          facebookUrl: 'https://facebook.com/ebookvala',
          instagramUrl: 'https://instagram.com/ebookvala',
          linkedinUrl: 'https://linkedin.com/company/ebookvala',
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching public site settings:', error);
    return NextResponse.json({
      id: 'default',
      siteName: 'EbookVala',
      supportEmail: 'support@ebookvala.com',
      maintenanceMode: false,
    });
  }
}
