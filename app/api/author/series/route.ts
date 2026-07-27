import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const seriesList = await prisma.bookSeries.findMany({
      where: { authorUserId: session.user.id },
      include: { books: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ series: seriesList });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch series' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Series name is required.' }, { status: 400 });
    }

    const newSeries = await prisma.bookSeries.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        authorUserId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, series: newSeries });
  } catch (error) {
    console.error('[CREATE SERIES ERROR]:', error);
    return NextResponse.json({ error: 'Failed to create series' }, { status: 500 });
  }
}
