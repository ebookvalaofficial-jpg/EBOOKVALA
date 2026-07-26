import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookGrid from '@/components/store/BookGrid';
import { prisma } from '@/lib/prisma';
import { Star, BookOpen, UserCheck } from 'lucide-react';

interface AuthorPageProps {
  params: Promise<{ authorSlug: string }>;
}

export async function generateMetadata({ params }: AuthorPageProps): Promise<Metadata> {
  const { authorSlug } = await params;
  const author = await prisma.author.findUnique({
    where: { slug: authorSlug },
  });

  if (!author) {
    return { title: 'Author Not Found — EbookVala' };
  }

  return {
    title: `${author.name} — Author Profile | EbookVala`,
    description: author.bio || `Explore all eBooks written by ${author.name} on EbookVala.`,
  };
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { authorSlug } = await params;

  const author = await prisma.author.findUnique({
    where: { slug: authorSlug },
    include: {
      books: {
        include: {
          author: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
        },
        orderBy: { rating: 'desc' },
      },
    },
  });

  if (!author) {
    notFound();
  }

  const avgAuthorRating =
    author.books.length > 0
      ? (author.books.reduce((acc, b) => acc + b.rating, 0) / author.books.length).toFixed(1)
      : '0.0';

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-12">
        {/* Author Header Profile */}
        <div className="p-8 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-primary-blue/30 shadow-2xl shrink-0 bg-slate-900">
            {author.avatarUrl ? (
              <Image src={author.avatarUrl} alt={author.name} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-black text-white brand-gradient-bg">
                {author.name.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-primary-blue bg-blue-500/10 border border-blue-500/20 mb-2">
                <UserCheck className="w-3.5 h-3.5" /> Verified EbookVala Author
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-theme-heading font-montserrat">
                {author.name}
              </h1>
            </div>

            <p className="text-sm sm:text-base text-theme-body leading-relaxed max-w-3xl font-inter">
              {author.bio || 'Passionate author creating high-value transformational eBooks.'}
            </p>

            <div className="flex items-center justify-center md:justify-start gap-6 pt-2 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-primary-blue flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-theme-heading text-sm block font-stats">{author.books.length}</span>
                  <span className="text-theme-muted font-normal">Published eBooks</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Star className="w-4 h-4 fill-amber-500" />
                </div>
                <div>
                  <span className="text-theme-heading text-sm block font-stats">{avgAuthorRating}</span>
                  <span className="text-theme-muted font-normal">Average Rating</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Books List by Author */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-theme-heading font-montserrat">
            eBooks by {author.name}
          </h2>
          <BookGrid books={author.books} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
