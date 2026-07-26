import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { adminCategorySchema } from '@/lib/validations/admin';

export async function GET() {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { books: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const validated = adminCategorySchema.parse(body);

    const existing = await prisma.category.findUnique({ where: { slug: validated.slug } });
    if (existing) {
      return NextResponse.json({ error: 'Category slug already exists' }, { status: 400 });
    }

    const category = await prisma.category.create({ data: validated });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'CATEGORY_CREATED',
      targetType: 'Category',
      targetId: category.id,
      details: { name: category.name },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const body = await req.json();
    const validated = adminCategorySchema.parse(body);

    const category = await prisma.category.update({
      where: { id },
      data: validated,
    });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'CATEGORY_UPDATED',
      targetType: 'Category',
      targetId: category.id,
      details: { name: category.name },
    });

    return NextResponse.json({ category });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Category ID required' }, { status: 400 });

    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { books: true } } },
    });

    if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });

    if (category._count.books > 0) {
      return NextResponse.json(
        { error: `Cannot delete category "${category.name}" because it contains ${category._count.books} books` },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'CATEGORY_DELETED',
      targetType: 'Category',
      targetId: id,
      details: { name: category.name },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete category' }, { status: 500 });
  }
}
