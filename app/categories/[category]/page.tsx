import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import CategoryClientContent from './CategoryClientContent';
import { prisma } from '@/lib/prisma';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    return { title: 'Category Not Found — EbookVala' };
  }

  return {
    title: `${category.name} eBooks — EbookVala`,
    description: category.description || `Browse top rated ${category.name} eBooks on EbookVala.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    notFound();
  }

  const books = await prisma.book.findMany({
    where: { categoryId: category.id },
    include: {
      author: { select: { name: true, slug: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { rating: 'desc' },
  });

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        <CategoryClientContent category={category} initialBooks={books} />
      </main>

      <Footer />
    </div>
  );
}
