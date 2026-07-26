export interface PricingTier {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPriceMonthly: number; // per month price when billed yearly
  yearlyDiscountPercent: number;
  description: string;
  popular?: boolean;
  features: string[];
  ctaText: string;
  highlightColor?: string;
}

export interface FeatureComparisonRow {
  category: string;
  featureName: string;
  free: boolean | string;
  starter: boolean | string;
  reader: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
}

export const pricingTiers: PricingTier[] = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPriceMonthly: 0,
    yearlyDiscountPercent: 0,
    description: "Basic reading access to open public titles with ad support.",
    features: [
      "Access to 500+ Public eBooks",
      "Standard Web Reader",
      "Ad-Supported Experience",
      "Single Device Access"
    ],
    ctaText: "Start Free"
  },
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 50,
    yearlyPriceMonthly: 40,
    yearlyDiscountPercent: 20,
    description: "Full library access without any interruptions or ads.",
    features: [
      "Access to 10,000+ Premium eBooks",
      "Zero Ads Experience",
      "Multi-Device Sync (2 Devices)",
      "Standard Reader Customization",
      "Community Access"
    ],
    ctaText: "Get Starter"
  },
  {
    id: "reader",
    name: "Reader",
    monthlyPrice: 100,
    yearlyPriceMonthly: 80,
    yearlyDiscountPercent: 20,
    description: "Unlimited reading with offline downloads and smart annotations.",
    features: [
      "Everything in Starter",
      "Unlimited Offline Downloads",
      "Bookmarks, Highlights & Notes Sync",
      "Reading Streak & Goal Tracker",
      "Up to 4 Devices Sync"
    ],
    ctaText: "Get Reader"
  },
  {
    id: "plus",
    name: "Plus",
    monthlyPrice: 180,
    yearlyPriceMonthly: 144,
    yearlyDiscountPercent: 20,
    popular: true,
    description: "Supercharged reading experience powered by advanced AI assistants.",
    features: [
      "Everything in Reader",
      "AI Chat with Book (Unlimited)",
      "Instant AI Book & Chapter Summaries",
      "AI Flashcards & Quiz Generator",
      "Multi-Language AI Translator",
      "Unlimited Devices Sync"
    ],
    ctaText: "Start Free Trial",
    highlightColor: "#3B82F6"
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 300,
    yearlyPriceMonthly: 240,
    yearlyDiscountPercent: 20,
    description: "The complete knowledge suite with audiobooks and VIP benefits.",
    features: [
      "Everything in Plus",
      "Full Audiobooks Library Access",
      "Human Voice AI Narrations",
      "Priority Customer Support 24/7",
      "Early Access to New Releases",
      "Export Notes & Highlights to Notion/Obsidian"
    ],
    ctaText: "Get Pro Access"
  }
];

export const featureComparisonMatrix: FeatureComparisonRow[] = [
  {
    category: "Library & Content",
    featureName: "eBook Library Catalog",
    free: "500+ Public",
    starter: "10,000+ Premium",
    reader: "10,000+ Premium",
    plus: "10,000+ Premium",
    pro: "10,000+ Premium & Audio"
  },
  {
    category: "Library & Content",
    featureName: "Ad-Free Reading",
    free: false,
    starter: true,
    reader: true,
    plus: true,
    pro: true
  },
  {
    category: "Reading Features",
    featureName: "Offline Downloads",
    free: false,
    starter: false,
    reader: true,
    plus: true,
    pro: true
  },
  {
    category: "Reading Features",
    featureName: "Highlights & Notes Sync",
    free: false,
    starter: "Basic",
    reader: true,
    plus: true,
    pro: true
  },
  {
    category: "AI Tools",
    featureName: "AI Chat with Book",
    free: false,
    starter: false,
    reader: false,
    plus: true,
    pro: true
  },
  {
    category: "AI Tools",
    featureName: "AI Chapter Summaries",
    free: false,
    starter: false,
    reader: false,
    plus: true,
    pro: true
  },
  {
    category: "AI Tools",
    featureName: "AI Flashcards & Quizzes",
    free: false,
    starter: false,
    reader: false,
    plus: true,
    pro: true
  },
  {
    category: "Audio",
    featureName: "Audiobooks & Voice Reader",
    free: false,
    starter: false,
    reader: false,
    plus: false,
    pro: true
  },
  {
    category: "Sync & Export",
    featureName: "Device Sync Limit",
    free: "1 Device",
    starter: "2 Devices",
    reader: "4 Devices",
    plus: "Unlimited",
    pro: "Unlimited"
  },
  {
    category: "Sync & Export",
    featureName: "Notion/Obsidian Note Export",
    free: false,
    starter: false,
    reader: false,
    plus: false,
    pro: true
  }
];
