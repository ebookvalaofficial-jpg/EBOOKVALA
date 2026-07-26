import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookQuerySchema } from '@/lib/validations/book';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const query = bookQuerySchema.parse(rawParams);

    const where: any = {};

    // Category filter (support single or comma separated)
    if (query.category) {
      const categorySlugs = query.category.split(',').map((s) => s.trim()).filter(Boolean);
      if (categorySlugs.length > 0) {
        where.category = {
          slug: { in: categorySlugs },
        };
      }
    }

    // Author filter
    if (query.author) {
      where.author = {
        slug: query.author,
      };
    }

    // Price range filter
    if (query.priceMin !== undefined || query.priceMax !== undefined) {
      where.price = {};
      if (query.priceMin !== undefined) where.price.gte = query.priceMin;
      if (query.priceMax !== undefined) where.price.lte = query.priceMax;
    }

    // Rating minimum filter
    if (query.ratingMin !== undefined) {
      where.rating = { gte: query.ratingMin };
    }

    // Format filter
    if (query.format) {
      where.format = { contains: query.format };
    }

    // Language filter
    if (query.language) {
      where.language = query.language;
    }

    // Search filter (title, description, author name)
    if (query.search && query.search.trim() !== '') {
      const searchTerm = query.search.trim();
      where.OR = [
        { title: { contains: searchTerm } },
        { description: { contains: searchTerm } },
        { author: { name: { contains: searchTerm } } },
      ];
    }

    // Flags
    if (query.isBestseller) where.isBestseller = true;
    if (query.isFeatured) where.isFeatured = true;
    if (query.isTrending) where.isTrending = true;

    // Sorting
    let orderBy: any = { createdAt: 'desc' };
    if (query.sort === 'popular') {
      orderBy = [{ isBestseller: 'desc' }, { reviewCount: 'desc' }, { rating: 'desc' }];
    } else if (query.sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (query.sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (query.sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (query.sort === 'rating_desc') {
      orderBy = { rating: 'desc' };
    }

    const skip = (query.page - 1) * query.limit;

    const [books, total] = await Promise.all([
      prisma.book.findMany({
        where,
        include: {
          author: { select: { name: true, slug: true, avatarUrl: true } },
          category: { select: { name: true, slug: true, icon: true } },
        },
        orderBy,
        skip,
        take: query.limit,
      }),
      prisma.book.count({ where }),
    ]);

    const totalPages = Math.ceil(total / query.limit);

    return NextResponse.json({
      books,
      total,
      totalPages,
      page: query.page,
      limit: query.limit,
    });
  } catch (error: any) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      { error: 'Failed to fetch books', details: error?.message },
      { status: 500 }
    );
  }
}
