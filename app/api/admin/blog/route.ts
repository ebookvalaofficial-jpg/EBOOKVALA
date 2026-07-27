import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createSlug } from '@/lib/formatters';

export async function GET() {
  try {
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ posts });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch blog posts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const admin = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, name: true },
    });

    if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, excerpt, content, coverImageUrl, authorName } = await req.json();

    if (!title || !excerpt || !content) {
      return NextResponse.json({ error: 'Title, excerpt, and content are required.' }, { status: 400 });
    }

    const slug = `${createSlug(title)}-${Date.now().toString().slice(-4)}`;

    const post = await prisma.blogPost.create({
      data: {
        title: title.trim(),
        slug,
        excerpt: excerpt.trim(),
        content: content.trim(),
        coverImageUrl: coverImageUrl || null,
        authorName: authorName?.trim() || admin.name || 'EbookVala Team',
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error('[ADMIN CREATE BLOG ERROR]:', error);
    return NextResponse.json({ error: 'Failed to create blog post' }, { status: 500 });
  }
}
