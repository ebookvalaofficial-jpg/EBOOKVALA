import React from 'react';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import { UserCheck, Sparkles, Globe, Mail } from 'lucide-react';

export default async function AuthorProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { email: session?.user?.email! },
    include: { authorProfile: true },
  });

  const author = user?.authorProfile;

  return (
    <div className="space-y-6 font-inter text-theme-text max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-theme-heading font-montserrat">Public Author Profile</h1>
        <p className="text-xs text-theme-muted">Your public pen name, bio, and storefront details.</p>
      </div>

      <div className="p-6 sm:p-8 rounded-3xl bg-theme-card border border-theme glass-card space-y-6 shadow-xl">
        <div className="flex items-center gap-4 border-b border-theme/60 pb-6">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-theme-surface border border-theme/60 shrink-0">
            {author?.avatarUrl ? (
              <Image src={author.avatarUrl} alt={author.name} fill className="object-cover" unoptimized />
            ) : (
              <UserCheck className="w-8 h-8 text-theme-muted m-auto" />
            )}
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-black uppercase tracking-wider">
              Verified Marketplace Author
            </span>
            <h2 className="text-xl font-bold text-theme-heading font-montserrat mt-1">{author?.name || user?.name}</h2>
            <p className="text-xs text-theme-muted flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email}</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Author Slug / Storefront URL</label>
          <div className="p-3 rounded-2xl bg-theme-surface/70 border border-theme/60 text-xs font-mono text-amber-500">
            /authors/{author?.slug || 'author-slug'}
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-theme-heading">Biography</label>
          <p className="text-xs text-theme-text font-semibold leading-relaxed p-4 rounded-2xl bg-theme-surface/50 border border-theme/40 whitespace-pre-line">
            {author?.bio || user?.bio || 'No bio specified.'}
          </p>
        </div>
      </div>
    </div>
  );
}
