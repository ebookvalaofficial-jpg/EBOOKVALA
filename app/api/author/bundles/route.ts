import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSlug } from '@/lib/formatters';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bundles = await prisma.bundle.findMany({
      where: { authorUserId: session.user.id },
      include: {
        books: {
          include: { book: { select: { id: true, title: true, price: true, coverImageUrl: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ bundles });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch bundles' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, bundlePrice, bookIds, coverImageUrl } = await req.json();

    if (!name || !name.trim() || !bundlePrice || !Array.isArray(bookIds) || bookIds.length === 0) {
      return NextResponse.json({ error: 'Name, price, and at least 1 book are required.' }, { status: 400 });
    }

    const slug = `${createSlug(name)}-${Date.now()}`;

    const bundle = await prisma.bundle.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        bundlePrice: parseInt(bundlePrice, 10),
        coverImageUrl: coverImageUrl || null,
        authorUserId: session.user.id,
        books: {
          create: bookIds.map((bId: string) => ({ bookId: bId })),
        },
      },
      include: { books: true },
    });

    return NextResponse.json({ success: true, bundle });
  } catch (error) {
    console.error('[CREATE BUNDLE ERROR]:', error);
    return NextResponse.json({ error: 'Failed to create bundle' }, { status: 500 });
  }
}
