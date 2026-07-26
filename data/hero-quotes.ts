export interface HeroQuoteCard {
  id: string;
  title: string;
  author: string;
  quote: string;
  coverImage: string;
  badge: string;
  rating: string;
  price: string;
  category: string;
  techMeta: string;
  readTime: string;
}

export const heroQuoteCards: HeroQuoteCard[] = [
  {
    id: 'hero-1',
    title: 'Mastering Digital Mindset & AI',
    author: 'Prince Gajera',
    quote: 'Reading is to the mind what exercise is to the body — every page builds mental stamina.',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    badge: 'BESTSELLER',
    rating: '4.9/5',
    price: '₹199',
    category: 'AI & Mindset',
    techMeta: 'MATCH 99% • REF #042-AI',
    readTime: '6 min read',
  },
  {
    id: 'hero-2',
    title: 'Exponential Habit Building',
    author: 'Bhanderi Prince',
    quote: 'Small daily improvements over time lead to stunning, exponential lifetime results.',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
    badge: 'EDITOR\'S CHOICE',
    rating: '4.8/5',
    price: '₹249',
    category: 'Productivity',
    techMeta: 'MATCH 98% • REF #108-PROD',
    readTime: '8 min read',
  },
  {
    id: 'hero-3',
    title: 'Architecting Scalable Systems',
    author: 'Elena Rostova',
    quote: 'Knowledge is not just power; knowledge is freedom, clarity, and limitless leverage.',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80',
    badge: 'MUST READ',
    rating: '4.9/5',
    price: '₹299',
    category: 'Engineering',
    techMeta: 'MATCH 96% • REF #502-ENG',
    readTime: '12 min read',
  },
  {
    id: 'hero-4',
    title: 'The Art of Deep Focus',
    author: 'Marcus Vance',
    quote: 'Deep focus is the superpower of the 21st century — master it to build the extraordinary.',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80',
    badge: 'TOP RATED',
    rating: '5.0/5',
    price: '₹179',
    category: 'Focus & Memory',
    techMeta: 'MATCH 99% • REF #301-FOC',
    readTime: '5 min read',
  },
  {
    id: 'hero-5',
    title: 'Financial Independence Playbook',
    author: 'Sophia Chen',
    quote: 'The best investment you can ever make is in your own mind and constant curiosity.',
    coverImage: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&w=600&q=80',
    badge: 'POPULAR',
    rating: '4.8/5',
    price: '₹219',
    category: 'Finance',
    techMeta: 'MATCH 97% • REF #880-FIN',
    readTime: '9 min read',
  },
  {
    id: 'hero-6',
    title: 'Thinking in Mental Models',
    author: 'Alexander Wright',
    quote: 'A reader lives a thousand lives before he dies; a non-reader lives only one.',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=600&q=80',
    badge: 'TRENDING',
    rating: '4.9/5',
    price: '₹199',
    category: 'Philosophy',
    techMeta: 'MATCH 95% • REF #614-MOD',
    readTime: '7 min read',
  },
  {
    id: 'hero-7',
    title: 'High-Performance Mindset',
    author: 'David Sterling',
    quote: 'Transform your daily habits, and your future will automatically take care of itself.',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
    badge: 'NEW RELEASE',
    rating: '4.9/5',
    price: '₹279',
    category: 'Self Growth',
    techMeta: 'MATCH 98% • REF #720-GROW',
    readTime: '10 min read',
  },
];
