'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Calendar, User, Loader2, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  authorName: string;
  publishedAt: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [authorName, setAuthorName] = useState('EbookVala Editorial Team');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/blog');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
      }
    } catch (err) {
      console.error('Fetch blog error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const res = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          coverImageUrl,
          authorName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setTitle('');
        setExcerpt('');
        setContent('');
        setShowModal(false);
        fetchPosts();
      } else {
        setError(data.error || 'Failed to create blog post.');
      }
    } catch (err) {
      setError('Network error creating post.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-8 font-inter text-theme-text">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 border border-blue-500/20 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-black uppercase tracking-wider text-blue-300 font-montserrat flex items-center gap-1.5">
            <BookOpen className="w-4 h-4" /> SEO Content Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-montserrat">
            Admin Blog Management
          </h1>
          <p className="text-xs text-blue-200">
            Publish and manage SEO articles, feature announcements, and reading guides on /blog.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Post</span>
        </button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
          <BookOpen className="w-12 h-12 text-blue-500 mx-auto opacity-50" />
          <h3 className="text-base font-extrabold text-theme-heading font-montserrat">No Blog Posts Found</h3>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            Publish articles to boost organic search engine traffic and educate readers!
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create First Article
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-3xl bg-theme-card border border-theme glass-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-blue-400 font-bold uppercase">/blog/{post.slug}</span>
                <h3 className="text-base font-extrabold text-theme-heading font-montserrat">{post.title}</h3>
                <p className="text-xs text-theme-muted line-clamp-1">{post.excerpt}</p>
                <div className="flex items-center gap-3 text-[11px] text-theme-muted font-medium pt-1">
                  <span>By {post.authorName}</span>
                  <span>•</span>
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                className="px-4 py-2 rounded-xl bg-theme-surface border border-theme text-xs font-bold text-theme-heading hover:bg-blue-600 hover:text-white transition-colors shrink-0"
              >
                View Live Post →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Blog Post */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-inter">
          <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-500" /> Publish Blog Article
            </h3>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Article Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10 Essential Programming Books for Senior Engineers"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm font-bold text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Short Excerpt (SEO Meta Description)
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                  placeholder="Brief summary for search engines and social cards..."
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-xs text-theme-heading"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Cover Image URL
                </label>
                <input
                  type="url"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-xs text-theme-heading"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Author Name
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-xs font-bold text-theme-heading"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Full Article Body (Markdown supported)
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  placeholder="Write article content here..."
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-xs text-theme-heading font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 transition-all shadow-md flex items-center gap-2"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Publish Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
