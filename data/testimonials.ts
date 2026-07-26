export interface Testimonial {
  id: string;
  name: string;
  profession: string;
  location: string;
  rating: number;
  comment: string;
  avatar: string;
  region: 'India' | 'UAE';
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Aarav Mehta",
    profession: "Software Engineer",
    location: "Mumbai, India",
    rating: 5,
    comment: "EbookVala's AI Chat with Book completely changed how I read technical docs and books. Instant summaries are a superpower!",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "2",
    name: "Priya Sharma",
    profession: "Product Designer",
    location: "Bengaluru, India",
    rating: 5,
    comment: "The reading interface is so sleek. Switching between dark and light reader modes with rich typography makes reading effortless.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "3",
    name: "Rohan Desai",
    profession: "Startup Founder",
    location: "Delhi, India",
    rating: 5,
    comment: "Having access to thousands of top business & self-help eBooks in one place with smart search saves me hours every single week.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "4",
    name: "Sneha Patel",
    profession: "Data Scientist",
    location: "Pune, India",
    rating: 4.9,
    comment: "The AI flashcards feature helps me retain key concepts from complex technical books effortlessly!",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "5",
    name: "Kabir Anand",
    profession: "Financial Analyst",
    location: "Hyderabad, India",
    rating: 5,
    comment: "The pricing tiers are insanely value-for-money. Plus plan is an absolute steal for anyone serious about self-improvement.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "6",
    name: "Ananya Iyer",
    profession: "Content Creator",
    location: "Chennai, India",
    rating: 5,
    comment: "The smooth animations, page-turn effects, and instant offline sync on mobile make EbookVala my favorite app.",
    avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "7",
    name: "Vivaan Shah",
    profession: "Marketing Manager",
    location: "Ahmedabad, India",
    rating: 4.8,
    comment: "The curated category bento grids helped me discover life-changing marketing & psychology books I'd never found elsewhere.",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "8",
    name: "Ishita Verma",
    profession: "Medical Student",
    location: "Jaipur, India",
    rating: 5,
    comment: "Being able to highlight, take notes, and ask AI questions directly inside the book reader is game-changing for study sessions.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "9",
    name: "Arjun Nair",
    profession: "Tech Lead",
    location: "Kochi, India",
    rating: 5,
    comment: "Offline mode works seamlessly on flights. Highlighting and syncing across laptop and mobile is flawless.",
    avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "10",
    name: "Meera Joshi",
    profession: "Executive Coach",
    location: "Kolkata, India",
    rating: 4.9,
    comment: "I recommend EbookVala to all my coaching clients. The reading streak counter keeps everyone consistently reading daily.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
    region: "India"
  },
  {
    id: "11",
    name: "Ahmed Al Maktoum",
    profession: "Venture Investor",
    location: "Dubai, UAE",
    rating: 5,
    comment: "EbookVala sets a new benchmark for eBook platforms. Powerful AI features combined with a world-class UI.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  },
  {
    id: "12",
    name: "Fatima Al Suwaidi",
    profession: "Entrepreneur",
    location: "Abu Dhabi, UAE",
    rating: 5,
    comment: "The multilingual search and instant AI translator make reading non-English titles smooth and accessible.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  },
  {
    id: "13",
    name: "Khalid Al Falasi",
    profession: "Growth Strategist",
    location: "Dubai, UAE",
    rating: 4.9,
    comment: "Cleanest reading UI I have ever used. The AI summary feature helps me vet books before diving deep.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  },
  {
    id: "14",
    name: "Mariam Hassan",
    profession: "UX Architect",
    location: "Sharjah, UAE",
    rating: 5,
    comment: "The attention to typography, dark mode contrast, and micro-interactions makes this platform an absolute joy to use daily.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  },
  {
    id: "15",
    name: "Omar Al Nuaimi",
    profession: "Product Manager",
    location: "Dubai, UAE",
    rating: 5,
    comment: "Having quiz generation from book chapters is brilliant for mastering business & finance principles quickly.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  },
  {
    id: "16",
    name: "Layla Ibrahim",
    profession: "Educator & Researcher",
    location: "Ajman, UAE",
    rating: 4.9,
    comment: "My students love the flashcards and audiobooks feature. EbookVala makes deep learning engaging and modern.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  },
  {
    id: "17",
    name: "Yousef Al Zaabi",
    profession: "Tech Consultant",
    location: "Ras Al Khaimah, UAE",
    rating: 5,
    comment: "Outstanding performance, super fast search, and the AI assistant answers contextually with page citations!",
    avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=150&q=80",
    region: "UAE"
  }
];
