import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookDetailHero from '@/components/store/BookDetailHero';
import ReviewsSection from '@/components/store/ReviewsSection';
import RelatedBooks from '@/components/store/RelatedBooks';
import { prisma } from '@/lib/prisma';
import SingleBookClientWrapper from './SingleBookClientWrapper';

interface BookPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await prisma.book.findFirst({
    where: { OR: [{ slug: slug }, { id: slug }] },
    include: { author: true, category: true },
  });

  if (!book) {
    return {
      title: 'Book Not Found — EbookVala',
    };
  }

  return {
    title: `${book.title} — EbookVala`,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      images: [{ url: book.coverImageUrl, alt: book.title }],
    },
  };
}

export default async function SingleBookPage({ params }: BookPageProps) {
  const { slug } = await params;

  const book = await prisma.book.findFirst({
    where: { OR: [{ slug: slug }, { id: slug }] },
    include: {
      author: true,
      category: true,
      reviews: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!book) {
    notFound();
  }

  // Related books from same category
  const relatedBooks = await prisma.book.findMany({
    where: {
      categoryId: book.categoryId,
      id: { not: book.id },
    },
    include: {
      author: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    take: 4,
    orderBy: { rating: 'desc' },
  });

  const formattedBook = {
    ...book,
    reviews: book.reviews.map((r) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
    })),
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-12">
        <SingleBookClientWrapper initialBook={formattedBook} initialRelated={relatedBooks} />
      </main>

      <Footer />
    </div>
  );
}
