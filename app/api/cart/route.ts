import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cartItemSchema, updateCartItemSchema } from '@/lib/validations/book';

export async function GET(req: NextRequest) {
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

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user.id },
      include: {
        book: {
          include: {
            author: { select: { name: true, slug: true } },
            category: { select: { name: true, slug: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.book.price * item.quantity,
      0
    );

    const originalTotal = cartItems.reduce(
      (acc, item) => acc + (item.book.originalPrice || item.book.price) * item.quantity,
      0
    );

    const totalDiscount = originalTotal - subtotal;
    const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return NextResponse.json({
      cartItems,
      subtotal,
      originalTotal,
      totalDiscount,
      itemCount,
    });
  } catch (error: any) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const body = await req.json();
    const validated = cartItemSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const book = await prisma.book.findUnique({
      where: { id: validated.bookId },
    });

    if (!book) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    const existing = await prisma.cartItem.findUnique({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: validated.bookId,
        },
      },
    });

    if (existing) {
      // Digital books are typically 1 copy, but we allow safe quantity update if requested
      const updated = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.min(existing.quantity + (validated.quantity || 1), 5) },
      });
      return NextResponse.json({
        cartItem: updated,
        message: 'Item already in cart (updated quantity)',
        alreadyInCart: true,
      });
    }

    const created = await prisma.cartItem.create({
      data: {
        userId: user.id,
        bookId: validated.bookId,
        quantity: validated.quantity || 1,
      },
      include: {
        book: {
          include: {
            author: { select: { name: true, slug: true } },
          },
        },
      },
    });

    const cartCount = await prisma.cartItem.count({
      where: { userId: user.id },
    });

    return NextResponse.json({
      cartItem: created,
      cartCount,
      message: 'Added to cart successfully',
    });
  } catch (error: any) {
    console.error('Error adding to cart:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to add to cart' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const validated = updateCartItemSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (validated.quantity <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          userId: user.id,
          bookId: validated.bookId,
        },
      });
      return NextResponse.json({ message: 'Item removed from cart' });
    }

    const updated = await prisma.cartItem.update({
      where: {
        userId_bookId: {
          userId: user.id,
          bookId: validated.bookId,
        },
      },
      data: { quantity: validated.quantity },
    });

    return NextResponse.json({ cartItem: updated, message: 'Cart updated' });
  } catch (error: any) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('bookId');
    const clearAll = searchParams.get('clearAll') === 'true';

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (clearAll) {
      await prisma.cartItem.deleteMany({
        where: { userId: user.id },
      });
      return NextResponse.json({ success: true, message: 'Cart cleared' });
    }

    if (!bookId) {
      return NextResponse.json({ error: 'bookId or clearAll is required' }, { status: 400 });
    }

    await prisma.cartItem.deleteMany({
      where: {
        userId: user.id,
        bookId: bookId,
      },
    });

    return NextResponse.json({ success: true, message: 'Removed from cart' });
  } catch (error: any) {
    console.error('Error deleting from cart:', error);
    return NextResponse.json(
      { error: 'Failed to remove from cart' },
      { status: 500 }
    );
  }
}
