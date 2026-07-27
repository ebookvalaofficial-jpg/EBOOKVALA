import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const posts = [
    {
      title: '5 Ways AI is Changing How We Read eBooks in 2026',
      slug: '5-ways-ai-is-changing-how-we-read',
      excerpt: 'Explore how real-time interactive AI chat with books, instant 10-minute summaries, and voice narration are transforming daily learning.',
      content: `Reading books is no longer a passive exercise. With modern AI tools integrated directly into digital readers, readers can now have two-way conversations with books, asking clarifying questions on complex chapters in real-time.

### 1. Instant Chapter Summarization
Instead of spending hours searching for key takeaways, AI algorithms extract core insights, actionable tips, and key quotes into 10-minute digests.

### 2. Conversational Q&A with Your eBooks
Stuck on a complex concept in a business or coding book? Ask the book directly! The AI retrieves context from the active chapter and responds with tailored explanations.

### 3. Voice AI & Multi-Device Sync
Seamless text-to-speech AI narration allows readers to switch from reading on desktop to listening on mobile without losing their place.

### 4. Automated Flashcards & Study Quizzes
Testing your comprehension has never been easier. Automatic flashcard generation turns key highlights into interactive review sessions.

### 5. Personalized Reading Recommendations
Machine learning models analyze your reading speed, completion rates, and favorite topics to surface the exact book you need next.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
      authorName: 'Prince Gajera',
    },
    {
      title: 'Building a Consistent Daily Reading Habit That Sticks',
      slug: 'building-a-consistent-daily-reading-habit',
      excerpt: 'How streak tracking, micro-reading goals, and gamified XP rewards help tech professionals read 30+ books every year.',
      content: `Most people want to read more, but struggle to find dedicated time amidst busy work schedules and constant digital notifications. Here is the framework used by top leaders to maintain a 100+ day reading streak.

### Start Small: 15 Minutes a Day
Don't set unrealistic goals like reading an hour daily right away. Committing to just 15 minutes of focused reading per day builds momentum without feeling overwhelming.

### Leverage Micro-Habits & Visual Streaks
Tracking your daily reading streak visually triggers intrinsic motivation. Seeing your streak count grow from 5 to 30 days makes you reluctant to break the chain.

### Keep Your Notes & Highlights Centralized
Don't let valuable insights vanish after closing a book. Exporting your highlighted quotes to Markdown or PDF ensures your knowledge remains searchable forever.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80',
      authorName: 'EbookVala Editorial Team',
    },
    {
      title: 'Welcome to the EbookVala Author & Publishing Partner Program',
      slug: 'welcome-to-ebookvala-author-program',
      excerpt: 'Learn how independent authors and tech writers earn 70% royalties with transparent analytics, co-author splits, and direct reader engagement.',
      content: `We built EbookVala to empower independent authors, tech creators, and domain experts to publish their work, retain high royalty rates, and connect directly with thousands of active readers.

### 70% Industry-Leading Royalty Rates
Authors earn 70% of every sale with transparent automated royalty ledger tracking and weekly payout options.

### Advanced Author Tools
Create custom discount coupons, invite co-authors with automated royalty percentage splits, share draft preview links with beta readers, and package series bundles.

### Join the Creator Network
Apply to become a verified author today through our streamlined author dashboard application flow!`,
      coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=800&q=80',
      authorName: 'Bhanderi Prince',
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: post,
      create: post,
    });
  }

  console.log('Seeded 3 blog posts successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
