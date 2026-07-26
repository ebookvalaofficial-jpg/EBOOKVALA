export interface Book {
  id: string;
  title: string;
  author: string;
  rating: number;
  reviewsCount: number;
  originalPrice: number;
  discountPrice: number;
  discountBadge: string;
  isBestseller?: boolean;
  category: string;
  coverImage: string;
  description: string;
  pages: number;
  language: string;
}

export const trendingBooks: Book[] = [
  {
    id: "b1",
    title: "The AI Revolution: Building Next-Gen Apps",
    author: "Dr. Alexander Wright",
    rating: 4.9,
    reviewsCount: 1420,
    originalPrice: 499,
    discountPrice: 199,
    discountBadge: "60% OFF",
    isBestseller: true,
    category: "Coding & AI",
    coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
    description: "A comprehensive guide to architecture, LLM integration, and building high-performance modern web apps with AI.",
    pages: 340,
    language: "English"
  },
  {
    id: "b2",
    title: "Atomic Growth: Daily Habits for Founders",
    author: "Vikram Sharma",
    rating: 5.0,
    reviewsCount: 2890,
    originalPrice: 399,
    discountPrice: 149,
    discountBadge: "62% OFF",
    isBestseller: true,
    category: "Self Help & Startup",
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
    description: "Master micro-habits, cognitive focus, and systematic execution to scale your business and personal growth rapidly.",
    pages: 280,
    language: "English & Hindi"
  },
  {
    id: "b3",
    title: "Financial Freedom in 30s: Modern Wealth",
    author: "Rohan Kapoor",
    rating: 4.8,
    reviewsCount: 950,
    originalPrice: 599,
    discountPrice: 249,
    discountBadge: "58% OFF",
    isBestseller: false,
    category: "Finance",
    coverImage: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80",
    description: "Deconstruct stock portfolios, index funds, real estate strategies, and passive income streams for long term independence.",
    pages: 310,
    language: "English"
  },
  {
    id: "b4",
    title: "Psychology of Digital Influence",
    author: "Dr. Maya Lin",
    rating: 4.9,
    reviewsCount: 1780,
    originalPrice: 450,
    discountPrice: 179,
    discountBadge: "60% OFF",
    isBestseller: true,
    category: "Psychology & Marketing",
    coverImage: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=600&q=80",
    description: "Explore behavioral economics, viral loop design, and persuasion frameworks used by world-class modern brands.",
    pages: 260,
    language: "English"
  },
  {
    id: "b5",
    title: "Clean Code & System Design Patterns",
    author: "Marcus Vance",
    rating: 4.95,
    reviewsCount: 3100,
    originalPrice: 699,
    discountPrice: 299,
    discountBadge: "57% OFF",
    isBestseller: true,
    category: "Coding",
    coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    description: "Write scalable, testable, and maintainable TypeScript & Next.js applications ready for high-load production environments.",
    pages: 420,
    language: "English"
  },
  {
    id: "b6",
    title: "Zero to Unicorn: The Startup Playbook",
    author: "Aditya & Priya Mehta",
    rating: 4.85,
    reviewsCount: 1120,
    originalPrice: 499,
    discountPrice: 199,
    discountBadge: "60% OFF",
    isBestseller: false,
    category: "Startup",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80",
    description: "Behind-the-scenes breakdown of product validation, fundraising tactics, hiring A-players, and early customer acquisition.",
    pages: 295,
    language: "English"
  }
];

export const featuredBook: Book = trendingBooks[0];
