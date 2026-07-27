import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { prisma } from '@/lib/prisma';
import { Calendar, User, ArrowLeft, Share2, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) return { title: 'Post Not Found — EbookVala' };

  return {
    title: `${post.title} — EbookVala Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [{ url: post.coverImageUrl }] : [],
    },
  };
}

export default async function BlogPostDetailPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16 font-inter">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-theme-muted hover:text-theme-heading transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Article Header */}
        <div className="space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-primary-blue border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> EbookVala Official Article
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-theme-heading font-montserrat tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-theme-muted font-semibold pt-2 border-t border-theme/60">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4 text-blue-500" /> {post.authorName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-purple-500" /> {new Date(post.publishedAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Featured Cover Image */}
        {post.coverImageUrl && (
          <div className="relative w-full h-72 sm:h-96 rounded-3xl overflow-hidden border border-theme shadow-xl">
            <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Article Body */}
        <div className="p-6 sm:p-10 rounded-3xl bg-theme-card border border-theme glass-card">
          <div className="prose dark:prose-invert max-w-none text-base text-theme-heading leading-relaxed font-serif space-y-6 whitespace-pre-wrap">
            {post.content}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
