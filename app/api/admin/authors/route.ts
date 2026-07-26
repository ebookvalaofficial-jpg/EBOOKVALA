import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { adminAuthorSchema } from '@/lib/validations/admin';

export async function GET() {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const authors = await prisma.author.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { books: true } } },
    });
    return NextResponse.json({ authors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch authors' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const validated = adminAuthorSchema.parse(body);

    const existing = await prisma.author.findUnique({ where: { slug: validated.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Author slug already exists' }, { status: 400 });
    }

    const author = await prisma.author.create({ data: validated });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'AUTHOR_CREATED',
      targetType: 'Author',
      targetId: author.id,
      details: { name: author.name },
    });

    return NextResponse.json({ author }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create author' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Author ID required' }, { status: 400 });

    const body = await req.json();
    const validated = adminAuthorSchema.parse(body);

    const author = await prisma.author.update({
      where: { id },
      data: validated,
    });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'AUTHOR_UPDATED',
      targetType: 'Author',
      targetId: author.id,
      details: { name: author.name },
    });

    return NextResponse.json({ author });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update author' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Author ID required' }, { status: 400 });

    const author = await prisma.author.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });

    if (!author) return NextResponse.json({ error: 'Author not found' }, { status: 404 });

    if (author._count.books > 0) {
      return NextResponse.json(
        { error: `Cannot delete author "${author.name}" because they have ${author._count.books} associated books` },
        { status: 400 }
      );
    }

    await prisma.author.delete({ where: { id } });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'AUTHOR_DELETED',
      targetType: 'Author',
      targetId: id,
      details: { name: author.name },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete author' }, { status: 500 });
  }
}
