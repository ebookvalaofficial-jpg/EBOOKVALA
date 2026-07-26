export interface FAQItem {
  id: string;
  category: 'Billing' | 'Reading Experience' | 'Account & Sync' | 'AI Features';
  question: string;
  answer: string;
}

export const faqCategories = ['All', 'Billing', 'Reading Experience', 'Account & Sync', 'AI Features'] as const;

export const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Billing',
    question: 'How does the monthly and yearly subscription billing work?',
    answer: 'Subscriptions are billed in INR (₹). If you select monthly, you are billed once per month. If you choose yearly billing, you receive an instant 20% discount and are billed for the full 12 months up front.'
  },
  {
    id: '2',
    category: 'Billing',
    question: 'Can I cancel or change my plan at any time?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time directly from your account settings with zero cancellation fees.'
  },
  {
    id: '3',
    category: 'Billing',
    question: 'What payment methods are supported on EbookVala?',
    answer: 'We support all major Indian & International payment methods including UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, and Wallet payments via secure encrypted gateways.'
  },
  {
    id: '4',
    category: 'Reading Experience',
    question: 'Can I read my eBooks offline without internet connection?',
    answer: 'Yes! Users on Reader, Plus, and Pro plans can download eBooks for offline reading. All your offline highlights and progress will automatically sync when you reconnect.'
  },
  {
    id: '5',
    category: 'Reading Experience',
    question: 'What formats are supported on EbookVala?',
    answer: 'EbookVala supports reflowable EPUBs, rich PDFs, Audiobooks, and custom digital interactive formats tailored for seamless reading across Web, iOS, and Android.'
  },
  {
    id: '6',
    category: 'Reading Experience',
    question: 'Can I customize text size, fonts, and dark mode theme?',
    answer: 'Absolutely! Our reading reader features customizable typography (Montserrat, Inter, Serif, Sans), adjustable font sizing, line height, background themes (Sepia, Pure Black OLED, Light Slate), and auto dark mode.'
  },
  {
    id: '7',
    category: 'Account & Sync',
    question: 'How does multi-device synchronization work?',
    answer: 'Your reading position, bookmarks, notes, and highlights are stored securely in cloud storage and instantly synced across all logged-in devices in real time.'
  },
  {
    id: '8',
    category: 'Account & Sync',
    question: 'How many devices can I log into simultaneously?',
    answer: 'Free plan allows 1 device, Starter allows 2 devices, Reader allows 4 devices, and Plus & Pro plans allow unlimited device access.'
  },
  {
    id: '9',
    category: 'AI Features',
    question: 'What is AI Chat with Book and how does it work?',
    answer: 'AI Chat with Book allows you to converse directly with any eBook in your library. Ask for explanations, character breakdowns, key takeaways, or page-cited answers without leaving the reader.'
  },
  {
    id: '10',
    category: 'AI Features',
    question: 'How does AI Chapter Summary generation work?',
    answer: 'Our AI engine analyzes the content of any chapter or full book and distills it into bullet points, executive summaries, and action steps in seconds.'
  },
  {
    id: '11',
    category: 'AI Features',
    question: 'Can EbookVala generate quizzes and flashcards for study?',
    answer: 'Yes! On Plus and Pro plans, EbookVala automatically extracts key concepts, definitions, and questions from your active book to build interactive flashcard decks and practice quizzes.'
  }
];
