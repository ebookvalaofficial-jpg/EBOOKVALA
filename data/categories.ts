export interface Category {
  id: string;
  name: string;
  bookCount: string;
  iconName: string; // Lucide icon name string
  description: string;
  gradient: string;
}

export const categories: Category[] = [
  {
    id: 'fiction',
    name: 'Fiction',
    bookCount: '1,850+ eBooks',
    iconName: 'BookOpen',
    description: 'Immersive stories, novels, sci-fi, fantasy, and narrative prose.',
    gradient: 'from-purple-900/40 via-indigo-900/30 to-blue-900/50',
  },
  {
    id: 'non-fiction',
    name: 'Non-Fiction',
    bookCount: '2,490+ eBooks',
    iconName: 'Sparkles',
    description: 'Science, technology, philosophy, history, and real-world knowledge.',
    gradient: 'from-blue-900/40 via-cyan-900/30 to-teal-900/50',
  },
  {
    id: 'self-help',
    name: 'Self Help',
    bookCount: '4,200+ eBooks',
    iconName: 'Zap',
    description: 'Building habits, high performance, focus, productivity, and mindset.',
    gradient: 'from-amber-900/30 via-orange-900/30 to-yellow-900/40',
  },
  {
    id: 'biography',
    name: 'Biography',
    bookCount: '1,410+ eBooks',
    iconName: 'UserCheck',
    description: 'Inspiring life stories of visionary leaders, founders, and icons.',
    gradient: 'from-slate-800/40 via-zinc-900/40 to-neutral-900/40',
  },
  {
    id: 'comic',
    name: 'Comic',
    bookCount: '1,120+ eBooks',
    iconName: 'Smile',
    description: 'Graphic novels, manga, illustrated stories, and visual art.',
    gradient: 'from-pink-900/40 via-rose-900/30 to-red-900/50',
  },
  {
    id: 'business-finance',
    name: 'Business & Finance',
    bookCount: '3,120+ eBooks',
    iconName: 'Briefcase',
    description: 'Wealth creation, entrepreneurship, investing, strategy, and leadership.',
    gradient: 'from-emerald-900/30 via-teal-900/30 to-blue-900/40',
  },
];
