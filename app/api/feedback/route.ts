import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, rating, comments } = body;

    if (!rating || !comments) {
      return NextResponse.json({ error: 'Rating and comments are required' }, { status: 400 });
    }

    const item = await prisma.feedback.create({
      data: {
        name: name || 'Anonymous',
        email: email || null,
        rating: Number(rating),
        comments,
      },
    });

    return NextResponse.json({ success: true, id: item.id }, { status: 201 });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
