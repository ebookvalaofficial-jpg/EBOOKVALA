import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkAdminAuth, logAdminAction } from '@/lib/admin-auth';
import { adminPromoCodeSchema } from '@/lib/validations/admin';

export async function GET() {
  const { errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ promoCodes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch promo codes' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const validated = adminPromoCodeSchema.parse(body);

    const existing = await prisma.promoCode.findUnique({ where: { code: validated.code.toUpperCase() } });
    if (existing) {
      return NextResponse.json({ error: 'Promo code already exists' }, { status: 400 });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code: validated.code.toUpperCase(),
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        minOrderAmount: validated.minOrderAmount ?? 0,
        maxUses: validated.maxUses ?? null,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        isActive: validated.isActive ?? true,
      },
    });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'PROMO_CODE_CREATED',
      targetType: 'PromoCode',
      targetId: promoCode.id,
      details: { code: promoCode.code, discountValue: promoCode.discountValue },
    });

    return NextResponse.json({ promoCode }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create promo code' }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Promo Code ID required' }, { status: 400 });

    const body = await req.json();
    const validated = adminPromoCodeSchema.parse(body);

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        code: validated.code.toUpperCase(),
        discountType: validated.discountType,
        discountValue: validated.discountValue,
        minOrderAmount: validated.minOrderAmount ?? 0,
        maxUses: validated.maxUses ?? null,
        expiresAt: validated.expiresAt ? new Date(validated.expiresAt) : null,
        isActive: validated.isActive,
      },
    });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'PROMO_CODE_UPDATED',
      targetType: 'PromoCode',
      targetId: promoCode.id,
      details: { code: promoCode.code, isActive: promoCode.isActive },
    });

    return NextResponse.json({ promoCode });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update promo code' }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const { adminUser, errorResponse } = await checkAdminAuth();
  if (errorResponse) return errorResponse;

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Promo Code ID required' }, { status: 400 });

    const promoCode = await prisma.promoCode.findUnique({ where: { id } });
    if (!promoCode) return NextResponse.json({ error: 'Promo Code not found' }, { status: 404 });

    await prisma.promoCode.delete({ where: { id } });

    await logAdminAction({
      adminUserId: adminUser!.id,
      action: 'PROMO_CODE_DELETED',
      targetType: 'PromoCode',
      targetId: id,
      details: { code: promoCode.code },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete promo code' }, { status: 500 });
  }
}
