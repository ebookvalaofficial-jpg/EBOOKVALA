import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { prisma } from '@/lib/prisma';
import { BookOpen, Sparkles, Calendar, User, ArrowRight } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Articles — EbookVala',
  description: 'Discover insights on AI reading tools, digital publishing, reading habits, and industry trends on EbookVala.',
};

export default async function BlogListingPage() {
  const posts = await prisma.blogPost.findMany({
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-theme-bg text-theme-body flex flex-col justify-between pt-28 pb-16 font-inter">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 space-y-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-primary-blue border border-blue-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Insights & Guides
          </span>
          <h1 className="text-3xl sm:text-5xl font-black font-montserrat text-theme-heading tracking-tight">
            The EbookVala Knowledge Hub
          </h1>
          <p className="text-sm text-theme-muted leading-relaxed font-medium">
            Explore articles on AI-powered eBook tools, reading efficiency habits, independent author spotlights, and digital learning strategies.
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-3xl bg-theme-card border border-theme glass-card overflow-hidden shadow-sm hover:border-blue-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                {post.coverImageUrl ? (
                  <div className="relative w-full h-48 overflow-hidden bg-slate-900">
                    <img
                      src={post.coverImageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-blue-900 to-indigo-950 flex items-center justify-center text-xs text-blue-300 font-bold">
                    EbookVala Article
                  </div>
                )}

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[11px] text-theme-muted font-semibold">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-blue-500" /> {post.authorName}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-purple-500" /> {new Date(post.publishedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h2 className="text-lg font-extrabold text-theme-heading font-montserrat leading-snug group-hover:text-primary-blue transition-colors">
                    {post.title}
                  </h2>

                  <p className="text-xs text-theme-muted leading-relaxed line-clamp-3">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2">
                <Link
                  href={`/blog/${post.slug}`}
                  className="text-xs font-extrabold text-primary-blue hover:text-blue-400 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>Read Article</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
