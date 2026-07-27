'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  BookOpen, Heart, Archive, Clock, FolderPlus, Star, WifiOff, Plus, Trash2, Loader2, Play
} from 'lucide-react';

interface BookItem {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string;
  price: number;
  author: { name: string };
  category: { name: string };
  percentComplete?: number;
  lastReadAt?: string;
}

interface CollectionItem {
  id: string;
  name: string;
  books: { book: BookItem }[];
}

export default function MyLibraryPage() {
  const [activeTab, setActiveTab] = useState<
    'purchased' | 'free' | 'wishlist' | 'favorites' | 'archived' | 'history' | 'collections'
  >('purchased');

  const [loading, setLoading] = useState(true);
  const [purchasedBooks, setPurchasedBooks] = useState<BookItem[]>([]);
  const [freeBooks, setFreeBooks] = useState<BookItem[]>([]);
  const [wishlistBooks, setWishlistBooks] = useState<BookItem[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<BookItem[]>([]);
  const [archivedBooks, setArchivedBooks] = useState<BookItem[]>([]);
  const [historyBooks, setHistoryBooks] = useState<BookItem[]>([]);
  const [collections, setCollections] = useState<CollectionItem[]>([]);

  // Create Collection Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [creatingCollection, setCreatingCollection] = useState(false);

  const fetchLibrary = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/dashboard/library');
      if (res.ok) {
        const json = await res.json();
        setPurchasedBooks(json.purchasedBooks || []);
        setFreeBooks(json.freeBooks || []);
        setWishlistBooks(json.wishlistBooks || []);
        setFavoriteBooks(json.favoriteBooks || []);
        setArchivedBooks(json.archivedBooks || []);
        setHistoryBooks(json.historyBooks || []);
        setCollections(json.collections || []);
      }
    } catch (err) {
      console.error('Library fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handleToggleFavorite = async (bookId: string) => {
    try {
      const res = await fetch('/api/dashboard/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) {
        await fetchLibrary();
      }
    } catch (err) {
      console.error('Favorite toggle error:', err);
    }
  };

  const handleToggleArchive = async (bookId: string) => {
    try {
      const res = await fetch('/api/dashboard/archive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId }),
      });
      if (res.ok) {
        await fetchLibrary();
      }
    } catch (err) {
      console.error('Archive toggle error:', err);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;
    try {
      setCreatingCollection(true);
      const res = await fetch('/api/dashboard/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', name: newCollectionName }),
      });
      if (res.ok) {
        setNewCollectionName('');
        setShowCreateModal(false);
        await fetchLibrary();
      }
    } catch (err) {
      console.error('Create collection error:', err);
    } finally {
      setCreatingCollection(false);
    }
  };

  const getActiveList = () => {
    switch (activeTab) {
      case 'purchased': return purchasedBooks;
      case 'free': return freeBooks;
      case 'wishlist': return wishlistBooks;
      case 'favorites': return favoriteBooks;
      case 'archived': return archivedBooks;
      case 'history': return historyBooks;
      default: return [];
    }
  };

  const currentBooks = getActiveList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-theme-card border border-theme glass-card">
        <div>
          <h1 className="text-2xl font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary-blue" /> My Personal Library
          </h1>
          <p className="text-xs text-theme-muted mt-1">
            Access your purchased eBooks, free downloads, favorites, custom folders, and reading progress.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-blue-500/10 text-primary-blue border border-blue-500/20 hover:bg-blue-500/20 text-xs font-bold transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-theme/60 scrollbar-none">
        {[
          { key: 'purchased', label: `Purchased (${purchasedBooks.length})`, icon: BookOpen },
          { key: 'free', label: `Free Books (${freeBooks.length})`, icon: Star },
          { key: 'wishlist', label: `Wishlist (${wishlistBooks.length})`, icon: Heart },
          { key: 'favorites', label: `Favorites (${favoriteBooks.length})`, icon: Star },
          { key: 'archived', label: `Archived (${archivedBooks.length})`, icon: Archive },
          { key: 'history', label: `History (${historyBooks.length})`, icon: Clock },
          { key: 'collections', label: `Collections (${collections.length})`, icon: FolderPlus },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-primary-blue text-white shadow-md shadow-blue-500/20'
                  : 'bg-theme-card text-theme-muted hover:text-theme-heading hover:bg-theme-surface border border-theme'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-blue" />
        </div>
      ) : activeTab === 'collections' ? (
        /* Collections / Folders Grid */
        <div className="space-y-6">
          {collections.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
              <FolderPlus className="w-12 h-12 text-theme-muted mx-auto opacity-40" />
              <h3 className="text-base font-extrabold text-theme-heading font-montserrat">No Custom Collections Yet</h3>
              <p className="text-xs text-theme-muted max-w-sm mx-auto">
                Organize your eBooks into custom folders like &quot;Tech & AI&quot;, &quot;Weekend Reads&quot;, or &quot;Self Improvement&quot;.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2.5 rounded-xl bg-primary-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors inline-flex items-center gap-2 mt-2"
              >
                <Plus className="w-4 h-4" /> Create First Collection
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {collections.map((c) => (
                <div key={c.id} className="p-5 rounded-3xl bg-theme-card border border-theme glass-card space-y-4 shadow-sm hover:border-blue-500/40 transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
                      <FolderPlus className="w-5 h-5 text-primary-blue" /> {c.name}
                    </h3>
                    <span className="text-xs font-bold text-theme-muted bg-theme-surface px-2.5 py-1 rounded-full border border-theme">
                      {c.books.length} Books
                    </span>
                  </div>

                  {c.books.length === 0 ? (
                    <p className="text-xs text-theme-muted italic">Empty collection</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 pt-2">
                      {c.books.slice(0, 4).map((cb) => (
                        <div key={cb.book.id} className="relative aspect-[3/4] rounded-lg overflow-hidden border border-theme shadow-xs bg-slate-900">
                          {cb.book.coverImageUrl && (
                            <Image src={cb.book.coverImageUrl} alt={cb.book.title} fill className="object-cover" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : currentBooks.length === 0 ? (
        /* Empty State */
        <div className="p-12 text-center rounded-3xl bg-theme-card border border-theme glass-card space-y-3">
          <BookOpen className="w-12 h-12 text-theme-muted mx-auto opacity-40" />
          <h3 className="text-base font-extrabold text-theme-heading font-montserrat">No books found in this tab</h3>
          <p className="text-xs text-theme-muted max-w-sm mx-auto">
            Browse the public store to discover new releases, bestsellers, and free community eBooks.
          </p>
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors mt-2 shadow-md"
          >
            Explore Book Store
          </Link>
        </div>
      ) : (
        /* Books Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {currentBooks.map((book) => {
            const isFav = favoriteBooks.some(f => f.id === book.id);
            const isArch = archivedBooks.some(a => a.id === book.id);

            return (
              <div key={book.id} className="p-4 rounded-3xl bg-theme-card border border-theme glass-card flex flex-col justify-between space-y-3 shadow-sm hover:border-blue-500/40 transition-all group">
                <div className="space-y-3">
                  {/* Cover Image + Offline Badge */}
                  <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md">
                    <Image src={book.coverImageUrl} alt={book.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />

                    {/* Offline Reading Badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-slate-950/80 backdrop-blur-md text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                      <WifiOff className="w-3 h-3" /> Available Offline
                    </div>

                    {/* Quick Action Icons overlay */}
                    <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleToggleFavorite(book.id)}
                        className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                          isFav ? 'bg-amber-500 text-white border-amber-400' : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                        title="Toggle Favorite"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <button
                        onClick={() => handleToggleArchive(book.id)}
                        className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                          isArch ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-950/70 text-slate-300 border-slate-700 hover:text-white'
                        }`}
                        title={isArch ? 'Unarchive' : 'Archive'}
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Details */}
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary-blue">
                      {book.category?.name || 'eBook'}
                    </span>
                    <h3 className="text-sm font-extrabold text-theme-heading font-montserrat truncate mt-0.5">
                      {book.title}
                    </h3>
                    <p className="text-xs text-theme-muted font-medium truncate">By {book.author?.name || 'Author'}</p>
                  </div>
                </div>

                {/* Progress or Read CTA */}
                <div className="pt-2 border-t border-theme/60 space-y-2">
                  {book.percentComplete !== undefined && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-theme-muted font-bold">
                        <span>Progress</span>
                        <span>{book.percentComplete}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-500/20 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${book.percentComplete}%` }} />
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/reader/${book.id}`}
                    className="w-full py-2.5 px-3 rounded-xl bg-primary-blue text-white text-xs font-bold hover:bg-blue-600 transition-colors flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Read Book</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Collection */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-3xl bg-theme-card border border-theme glass-card shadow-2xl space-y-4">
            <h3 className="text-lg font-extrabold text-theme-heading font-montserrat flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-primary-blue" /> Create New Collection
            </h3>
            <form onSubmit={handleCreateCollection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-theme-heading uppercase tracking-wider mb-1">
                  Collection Name
                </label>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g. Masterpieces, Tech Books"
                  className="w-full px-4 py-2.5 bg-theme-surface border border-theme rounded-xl text-sm text-theme-heading focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-theme-muted hover:text-theme-heading"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCollection}
                  className="px-5 py-2.5 rounded-xl bg-primary-blue text-white text-xs font-bold hover:bg-blue-600 transition-all shadow-md flex items-center gap-2"
                >
                  {creatingCollection ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Folder'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
