import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EbookVala Phase 3 Database Seeding...');

  // 1. Seed Test Users
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const user1 = await prisma.user.upsert({
    where: { email: 'prince@ebookvala.com' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      email: 'prince@ebookvala.com',
      name: 'Prince Gajera',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      emailVerified: new Date(),
      image: '/team/prince-gajera.jpg',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'bhanderi@ebookvala.com' },
    update: { role: 'ADMIN' },
    create: {
      email: 'bhanderi@ebookvala.com',
      name: 'Bhanderi Prince',
      password: hashedPassword,
      role: 'ADMIN',
      emailVerified: new Date(),
      image: '/team/bhanderi-prince.jpg',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'reader@example.com' },
    update: { role: 'USER' },
    create: {
      email: 'reader@example.com',
      name: 'Aarav Sharma',
      password: hashedPassword,
      role: 'USER',
      emailVerified: new Date(),
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
  });

  // 2. Seed 6 Categories
  const categoriesData = [
    { slug: 'fiction', name: 'Fiction', icon: 'BookOpen', description: 'Immersive stories, novels, sci-fi, fantasy, and narrative prose.' },
    { slug: 'non-fiction', name: 'Non-Fiction', icon: 'Sparkles', description: 'Science, technology, philosophy, history, and real-world knowledge.' },
    { slug: 'self-help', name: 'Self Help', icon: 'Zap', description: 'Personal growth, productivity systems, mindset, and habits.' },
    { slug: 'biography', name: 'Biography', icon: 'UserCheck', description: 'Life lessons from visionary leaders, founders, and innovators.' },
    { slug: 'comic', name: 'Comic', icon: 'Smile', description: 'Graphic novels, manga, illustrated stories, and visual art.' },
    { slug: 'business-finance', name: 'Business & Finance', icon: 'Briefcase', description: 'Wealth creation, entrepreneurship, investing, strategy, and leadership.' },
  ];

  const validSlugs = categoriesData.map(c => c.slug);

  const categoriesMap: Record<string, string> = {};

  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, description: cat.description },
      create: cat,
    });
    categoriesMap[cat.slug] = created.id;
  }

  // Remap existing books attached to old categories to new category IDs
  const nonFictionCat = categoriesMap['non-fiction'];
  const bizFinCat = categoriesMap['business-finance'];

  const oldCategories = await prisma.category.findMany({
    where: { slug: { notIn: validSlugs } },
  });

  for (const oldCat of oldCategories) {
    const targetId = ['business', 'finance', 'marketing', 'startup'].includes(oldCat.slug)
      ? bizFinCat
      : nonFictionCat;

    if (targetId) {
      await prisma.book.updateMany({
        where: { categoryId: oldCat.id },
        data: { categoryId: targetId },
      });
      await prisma.authorBookSubmission.updateMany({
        where: { categoryId: oldCat.id },
        data: { categoryId: targetId },
      });
      await prisma.discussion.updateMany({
        where: { categoryId: oldCat.id },
        data: { categoryId: targetId },
      });
    }
  }

  await prisma.category.deleteMany({
    where: { slug: { notIn: validSlugs } },
  });

  console.log(`✅ Seeded ${Object.keys(categoriesMap).length} Categories`);

  // 3. Seed 6 Authors
  const authorsData = [
    {
      slug: 'prince-gajera',
      name: 'Prince Gajera',
      bio: 'Full-Stack Developer, AI Architect, and Co-Founder at EbookVala. Passionate about scalable Web3 systems & modern software design.',
      avatarUrl: '/team/prince-gajera.jpg',
    },
    {
      slug: 'bhanderi-prince',
      name: 'Bhanderi Prince',
      bio: 'Co-Founder — Social Media & Business Operations at EbookVala. Growth strategist helping thousands of readers build high-value habits.',
      avatarUrl: '/team/bhanderi-prince.jpg',
    },
    {
      slug: 'alexander-wright',
      name: 'Dr. Alexander Wright',
      bio: 'AI Researcher and Cognitive Scientist. Author of 5 best-selling tech handbooks on machine intelligence and human cognition.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    {
      slug: 'sarah-jenkins',
      name: 'Sarah Jenkins',
      bio: 'Venture Partner & Startup Advisor with 12+ years guiding YC and Techstars portfolio founders from seed to Series C.',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    },
    {
      slug: 'marcus-vance',
      name: 'Marcus Vance',
      bio: 'Quantitative Trader & Wealth Strategist. Specialist in asymmetric risk management and long-term portfolio compounding.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      slug: 'elena-roost',
      name: 'Elena Roost',
      bio: 'Behavioral Psychologist and Executive Coach. Expert on high-performance habit loops and neuro-linguistic focus.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const authorsMap: Record<string, string> = {};

  for (const auth of authorsData) {
    const created = await prisma.author.upsert({
      where: { slug: auth.slug },
      update: { name: auth.name, bio: auth.bio, avatarUrl: auth.avatarUrl },
      create: auth,
    });
    authorsMap[auth.slug] = created.id;
  }
  console.log(`✅ Seeded ${Object.keys(authorsMap).length} Authors`);

  // 4. Seed 32 Realistic Books
  const booksData = [
    {
      slug: 'ai-revolution-building-future',
      title: 'The AI Revolution: Building the Future',
      authorSlug: 'alexander-wright',
      categorySlug: 'non-fiction',
      description: 'Master practical AI systems, generative workflows, and LLM application architectures from ground zero. A comprehensive blueprint for modern engineers and tech creators.',
      coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
      price: 199,
      originalPrice: 499,
      discountPercent: 60,
      rating: 4.9,
      reviewCount: 142,
      pageCount: 340,
      language: 'English',
      format: 'EPUB, PDF, MP3',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'full-stack-nextjs-mastery',
      title: 'Full-Stack Next.js 16 & React 19 Mastery',
      authorSlug: 'prince-gajera',
      categorySlug: 'non-fiction',
      description: 'Build production-grade web apps using Next.js 16 App Router, Server Actions, Tailwind CSS, Prisma ORM, and NextAuth v5. Step-by-step code patterns included.',
      coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=600&q=80',
      price: 249,
      originalPrice: 599,
      discountPercent: 58,
      rating: 4.95,
      reviewCount: 98,
      pageCount: 412,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'scalable-wealth-compounding',
      title: 'Scalable Wealth: The Art of Asymmetric Compounding',
      authorSlug: 'marcus-vance',
      categorySlug: 'business-finance',
      description: 'Learn the exact financial models used by elite quantitative traders to manage risk, optimize equity splits, and build multi-generational compounding assets.',
      coverImageUrl: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=600&q=80',
      price: 149,
      originalPrice: 399,
      discountPercent: 63,
      rating: 4.8,
      reviewCount: 86,
      pageCount: 280,
      language: 'English',
      format: 'EPUB, PDF, Audiobook',
      isBestseller: true,
      isFeatured: false,
      isTrending: true,
    },
    {
      slug: 'atomic-focus-deep-work-playbook',
      title: 'Atomic Focus: Deep Work & High Output Playbook',
      authorSlug: 'elena-roost',
      categorySlug: 'self-help',
      description: 'Eliminate digital distraction and reclaim 4+ hours of uninterrupted flow daily. Backed by neuroscience, circadian optimization, and high-performance habits.',
      coverImageUrl: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80',
      price: 129,
      originalPrice: 299,
      discountPercent: 57,
      rating: 4.85,
      reviewCount: 215,
      pageCount: 220,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'zero-to-one-million-users',
      title: 'Zero to 1M Users: The Growth Hacker Handbook',
      authorSlug: 'bhanderi-prince',
      categorySlug: 'business-finance',
      description: 'Unconventional customer acquisition tactics, viral loops, community building, and organic distribution for early-stage startup founders.',
      coverImageUrl: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=600&q=80',
      price: 179,
      originalPrice: 449,
      discountPercent: 60,
      rating: 4.9,
      reviewCount: 167,
      pageCount: 295,
      language: 'English',
      format: 'EPUB, PDF, Audio',
      isBestseller: true,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'prompt-engineering-for-executives',
      title: 'Prompt Engineering for Business Executives',
      authorSlug: 'alexander-wright',
      categorySlug: 'non-fiction',
      description: 'Automate marketing pipelines, internal knowledge bases, code reviews, and executive reporting using advanced LLM prompting strategies.',
      coverImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80',
      price: 199,
      originalPrice: 399,
      discountPercent: 50,
      rating: 4.75,
      reviewCount: 74,
      pageCount: 190,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: true,
    },
    {
      slug: 'mental-models-for-decision-makers',
      title: 'Mental Models for High-Stakes Decision Makers',
      authorSlug: 'elena-roost',
      categorySlug: 'non-fiction',
      description: '30 mental frameworks from physics, biology, and game theory to analyze complex problems, eliminate cognitive biases, and make sharp choices under pressure.',
      coverImageUrl: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=600&q=80',
      price: 159,
      originalPrice: 349,
      discountPercent: 54,
      rating: 4.88,
      reviewCount: 112,
      pageCount: 260,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'venture-capital-unlocked',
      title: 'Venture Capital Unlocked: Pitch, Raise & Scale',
      authorSlug: 'sarah-jenkins',
      categorySlug: 'business-finance',
      description: 'Inside look at pitch deck teardowns, cap table math, term sheet negotiations, and valuation traps from top Silicon Valley venture partners.',
      coverImageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80',
      price: 229,
      originalPrice: 499,
      discountPercent: 54,
      rating: 4.7,
      reviewCount: 53,
      pageCount: 310,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'modern-system-design-interview',
      title: 'Modern System Design: Distributed Architecture',
      authorSlug: 'prince-gajera',
      categorySlug: 'non-fiction',
      description: 'Master rate limiting, load balancing, message queues, sharding, consensus protocols, and microservice resilience for Senior/Staff engineer roles.',
      coverImageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
      price: 299,
      originalPrice: 699,
      discountPercent: 57,
      rating: 4.96,
      reviewCount: 310,
      pageCount: 450,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'biohacking-longevity-blueprint',
      title: 'Biohacking Longevity: Peak Cellular Performance',
      authorSlug: 'elena-roost',
      categorySlug: 'non-fiction',
      description: 'Evidence-based strategies for mitochondrial health, sleep optimization, glucose management, fasting protocols, and cognitive endurance.',
      coverImageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80',
      price: 139,
      originalPrice: 299,
      discountPercent: 53,
      rating: 4.65,
      reviewCount: 89,
      pageCount: 235,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'copywriting-that-converts-millions',
      title: 'Copywriting That Converts Millions',
      authorSlug: 'bhanderi-prince',
      categorySlug: 'business-finance',
      description: 'Psychological triggers, headline formulas, landing page story arcs, and cold email frameworks that turn casual readers into loyal buyers.',
      coverImageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=80',
      price: 169,
      originalPrice: 379,
      discountPercent: 55,
      rating: 4.82,
      reviewCount: 145,
      pageCount: 210,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: false,
      isTrending: true,
    },
    {
      slug: 'steve-jobs-relentless-vision',
      title: 'Relentless Vision: Lessons from Iconic Founders',
      authorSlug: 'sarah-jenkins',
      categorySlug: 'biography',
      description: 'Deep narrative analysis of product obsessiveness, design philosophy, and leadership grit behind Apple, Tesla, Pixar, and Amazon.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      price: 199,
      originalPrice: 449,
      discountPercent: 56,
      rating: 4.91,
      reviewCount: 280,
      pageCount: 380,
      language: 'English',
      format: 'EPUB, PDF, Audiobook',
      isBestseller: true,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'python-for-data-science-ai',
      title: 'Python 3.12 for Data Science & Machine Learning',
      authorSlug: 'alexander-wright',
      categorySlug: 'non-fiction',
      description: 'Pandas 2.0, NumPy, PyTorch 2.5, and Scikit-Learn. Build end-to-end data pipelines and deploy custom neural network models.',
      coverImageUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80',
      price: 219,
      originalPrice: 499,
      discountPercent: 56,
      rating: 4.78,
      reviewCount: 92,
      pageCount: 360,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: true,
    },
    {
      slug: 'stoicism-for-modern-leaders',
      title: 'Stoicism for Modern Leaders & Founders',
      authorSlug: 'elena-roost',
      categorySlug: 'self-help',
      description: 'Practical daily reflections from Marcus Aurelius and Seneca applied to startup pivots, team conflicts, and economic uncertainty.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=600&q=80',
      price: 119,
      originalPrice: 249,
      discountPercent: 52,
      rating: 4.87,
      reviewCount: 178,
      pageCount: 185,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'bootstrapping-saas-to-10k-mrr',
      title: 'Bootstrapping Micro-SaaS to $10k MRR',
      authorSlug: 'prince-gajera',
      categorySlug: 'business-finance',
      description: 'Solopreneur guide to finding profitable niches, building MVPs fast with Next.js, Stripe integration, and organic SEO ranking.',
      coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80',
      price: 189,
      originalPrice: 429,
      discountPercent: 56,
      rating: 4.93,
      reviewCount: 204,
      pageCount: 275,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'crypto-defi-tokenomics-handbook',
      title: 'DeFi & Tokenomics Architectures',
      authorSlug: 'marcus-vance',
      categorySlug: 'business-finance',
      description: 'Understanding automated market makers, staking yields, governance tokens, liquidity pools, and smart contract audit risks.',
      coverImageUrl: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=600&q=80',
      price: 199,
      originalPrice: 499,
      discountPercent: 60,
      rating: 4.62,
      reviewCount: 61,
      pageCount: 290,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'behavioral-economics-in-product-design',
      title: 'Behavioral Economics in UI/UX Design',
      authorSlug: 'bhanderi-prince',
      categorySlug: 'non-fiction',
      description: 'How loss aversion, friction points, habit loops, and social proof shape product adoption and user engagement metrics.',
      coverImageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
      price: 149,
      originalPrice: 329,
      discountPercent: 55,
      rating: 4.84,
      reviewCount: 103,
      pageCount: 230,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'autonomous-ai-agents-langchain',
      title: 'Autonomous AI Agents with LangChain & LlamaIndex',
      authorSlug: 'alexander-wright',
      categorySlug: 'non-fiction',
      description: 'Design self-correcting RAG applications, multi-agent orchestrations, vector search algorithms, and tool-calling AI bots.',
      coverImageUrl: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=600&q=80',
      price: 249,
      originalPrice: 599,
      discountPercent: 58,
      rating: 4.92,
      reviewCount: 155,
      pageCount: 385,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'brand-positioning-category-creation',
      title: 'Category Creation: Dominate Uncontested Markets',
      authorSlug: 'sarah-jenkins',
      categorySlug: 'business-finance',
      description: 'Stop competing in crowded red oceans. Learn how Salesforce, Hubspot, and Snowflake defined new market categories and won.',
      coverImageUrl: 'https://images.unsplash.com/photo-1542744094-3a3172720177?auto=format&fit=crop&w=600&q=80',
      price: 179,
      originalPrice: 399,
      discountPercent: 55,
      rating: 4.79,
      reviewCount: 79,
      pageCount: 265,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'clean-code-typescript-design-patterns',
      title: 'Clean Code TypeScript & Gang of Four Patterns',
      authorSlug: 'prince-gajera',
      categorySlug: 'non-fiction',
      description: 'SOLID principles, Factory, Singleton, Observer, Strategy, and Adapter patterns refactored cleanly in idiomatic modern TypeScript.',
      coverImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80',
      price: 229,
      originalPrice: 499,
      discountPercent: 54,
      rating: 4.94,
      reviewCount: 240,
      pageCount: 345,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: false,
      isTrending: true,
    },
    {
      slug: 'high-output-management-executives',
      title: 'High-Output Executive Management',
      authorSlug: 'sarah-jenkins',
      categorySlug: 'business-finance',
      description: 'Leverage points, 1-on-1 meeting templates, OKR alignment, and performance evaluation systems for engineering & product leaders.',
      coverImageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80',
      price: 189,
      originalPrice: 399,
      discountPercent: 52,
      rating: 4.81,
      reviewCount: 96,
      pageCount: 295,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'habit-loops-and-dopamine-detox',
      title: 'Dopamine Reset: The Science of Sustained Motivation',
      authorSlug: 'elena-roost',
      categorySlug: 'self-help',
      description: 'Break cheap dopamine addiction, reset neuro-reward pathways, and cultivate effortless long-term discipline for deep creative work.',
      coverImageUrl: 'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?auto=format&fit=crop&w=600&q=80',
      price: 119,
      originalPrice: 279,
      discountPercent: 57,
      rating: 4.86,
      reviewCount: 312,
      pageCount: 195,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: false,
      isTrending: true,
    },
    {
      slug: 'personal-tax-planning-india',
      title: 'Smart Tax Planning & Wealth Protection for Indians',
      authorSlug: 'marcus-vance',
      categorySlug: 'business-finance',
      description: 'Section 80C, capital gains optimization, HUF setup, NPS strategy, and international asset diversification under Indian tax law.',
      coverImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
      price: 139,
      originalPrice: 299,
      discountPercent: 53,
      rating: 4.77,
      reviewCount: 148,
      pageCount: 215,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'microservices-kubernetes-docker',
      title: 'Kubernetes & Docker Microservices in Action',
      authorSlug: 'prince-gajera',
      categorySlug: 'non-fiction',
      description: 'Container orchestration, Helm charts, ingress controllers, CI/CD GitHub Actions pipelines, and zero-downtime blue-green deployments.',
      coverImageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=600&q=80',
      price: 279,
      originalPrice: 599,
      discountPercent: 53,
      rating: 4.9,
      reviewCount: 188,
      pageCount: 420,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'sleep-optimization-for-knowledge-workers',
      title: 'The Sleep Advantage for High-Performers',
      authorSlug: 'elena-roost',
      categorySlug: 'non-fiction',
      description: 'Circadian phase shifts, REM sleep maximization, supplement protocols, and thermal environment control for peak mental sharpness.',
      coverImageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80',
      price: 109,
      originalPrice: 249,
      discountPercent: 56,
      rating: 4.73,
      reviewCount: 94,
      pageCount: 175,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'b2b-sales-enterprise-deals',
      title: 'Enterprise B2B Sales: Closing $100k+ Deals',
      authorSlug: 'bhanderi-prince',
      categorySlug: 'business-finance',
      description: 'MEDDPICC sales framework, stakeholder alignment, procurement negotiation, and executive sponsor engagement strategies.',
      coverImageUrl: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=600&q=80',
      price: 199,
      originalPrice: 449,
      discountPercent: 56,
      rating: 4.83,
      reviewCount: 67,
      pageCount: 270,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: true,
      isTrending: false,
    },
    {
      slug: 'neural-networks-from-scratch',
      title: 'Building Neural Networks from Scratch in C++',
      authorSlug: 'alexander-wright',
      categorySlug: 'non-fiction',
      description: 'Understand backpropagation, gradient descent, matrix multiplication CUDA kernels, and transformer attention mechanisms from pure math.',
      coverImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80',
      price: 299,
      originalPrice: 699,
      discountPercent: 57,
      rating: 4.97,
      reviewCount: 220,
      pageCount: 480,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'real-estate-investing-india',
      title: 'Commercial & Residential Real Estate Investing',
      authorSlug: 'marcus-vance',
      categorySlug: 'business-finance',
      description: 'Rental yield calculation, REITs analysis, land due diligence, property flipping risk models, and long-term equity growth.',
      coverImageUrl: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
      price: 169,
      originalPrice: 399,
      discountPercent: 57,
      rating: 4.69,
      reviewCount: 82,
      pageCount: 250,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'biography-elon-musk-first-principles',
      title: 'First Principles Thinking: The Elon Musk Playbook',
      authorSlug: 'sarah-jenkins',
      categorySlug: 'biography',
      description: 'Breaking down engineering problems to physics fundamentals. Case studies from SpaceX Falcon 9 reuse and Tesla Gigafactory manufacturing.',
      coverImageUrl: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&w=600&q=80',
      price: 199,
      originalPrice: 449,
      discountPercent: 56,
      rating: 4.89,
      reviewCount: 295,
      pageCount: 365,
      language: 'English',
      format: 'EPUB, PDF, Audiobook',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'psychology-of-money-mastery',
      title: 'The Psychology of Money & Financial Freedom',
      authorSlug: 'marcus-vance',
      categorySlug: 'non-fiction',
      description: 'Timeless lessons on greed, risk, patience, and happiness. How your relationship with money dictates your ultimate freedom.',
      coverImageUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80',
      price: 149,
      originalPrice: 349,
      discountPercent: 57,
      rating: 4.95,
      reviewCount: 420,
      pageCount: 240,
      language: 'English',
      format: 'EPUB, PDF, Audiobook',
      isBestseller: true,
      isFeatured: true,
      isTrending: true,
    },
    {
      slug: 'cybersecurity-red-team-handbook',
      title: 'Cybersecurity Red Team Offensive Operations',
      authorSlug: 'prince-gajera',
      categorySlug: 'non-fiction',
      description: 'Penetration testing, active directory exploitation, web application vulnerability assessment, zero-day research, and ethical hacking.',
      coverImageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=600&q=80',
      price: 249,
      originalPrice: 549,
      discountPercent: 55,
      rating: 4.88,
      reviewCount: 110,
      pageCount: 390,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
    {
      slug: 'agile-product-management-playbook',
      title: 'Agile Product Management: From PRD to Launch',
      authorSlug: 'bhanderi-prince',
      categorySlug: 'business-finance',
      description: 'Sprint planning, user story mapping, feature prioritization matrices (RICE framework), and customer feedback telemetry loops.',
      coverImageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80',
      price: 169,
      originalPrice: 369,
      discountPercent: 54,
      rating: 4.76,
      reviewCount: 88,
      pageCount: 255,
      language: 'English',
      format: 'EPUB, PDF',
      isBestseller: false,
      isFeatured: false,
      isTrending: false,
    },
  ];

  const seededBooks: Record<string, string> = {};

  for (const b of booksData) {
    const created = await prisma.book.upsert({
      where: { slug: b.slug },
      update: {
        title: b.title,
        description: b.description,
        coverImageUrl: b.coverImageUrl,
        price: b.price,
        originalPrice: b.originalPrice,
        discountPercent: b.discountPercent,
        rating: b.rating,
        reviewCount: b.reviewCount,
        pageCount: b.pageCount,
        language: b.language,
        format: b.format,
        isBestseller: b.isBestseller,
        isFeatured: b.isFeatured,
        isTrending: b.isTrending,
      },
      create: {
        slug: b.slug,
        title: b.title,
        description: b.description,
        coverImageUrl: b.coverImageUrl,
        price: b.price,
        originalPrice: b.originalPrice,
        discountPercent: b.discountPercent,
        rating: b.rating,
        reviewCount: b.reviewCount,
        pageCount: b.pageCount,
        language: b.language,
        format: b.format,
        isBestseller: b.isBestseller,
        isFeatured: b.isFeatured,
        isTrending: b.isTrending,
        authorId: authorsMap[b.authorSlug],
        categoryId: categoriesMap[b.categorySlug],
      },
    });
    seededBooks[b.slug] = created.id;
  }

  // Update book counts on categories and authors
  for (const catSlug of Object.keys(categoriesMap)) {
    const count = await prisma.book.count({ where: { categoryId: categoriesMap[catSlug] } });
    await prisma.category.update({ where: { id: categoriesMap[catSlug] }, data: { bookCount: count } });
  }

  for (const authSlug of Object.keys(authorsMap)) {
    const count = await prisma.book.count({ where: { authorId: authorsMap[authSlug] } });
    await prisma.author.update({ where: { id: authorsMap[authSlug] }, data: { booksCount: count } });
  }

  console.log(`✅ Seeded ${Object.keys(seededBooks).length} Books`);

  // 5. Seed Sample Reviews
  const reviewsData = [
    {
      bookSlug: 'ai-revolution-building-future',
      userEmail: 'bhanderi@ebookvala.com',
      rating: 5,
      comment: 'An absolute game changer! The architecture diagrams and LLM integration code snippets saved our team weeks of trial and error.',
    },
    {
      bookSlug: 'ai-revolution-building-future',
      userEmail: 'reader@example.com',
      rating: 5,
      comment: 'Super crisp writing. Explains complex neural concepts with absolute clarity and practical business applications.',
    },
    {
      bookSlug: 'full-stack-nextjs-mastery',
      userEmail: 'reader@example.com',
      rating: 5,
      comment: 'Prince Gajera does an exceptional job breaking down Next.js 16 App Router & React 19 Server Actions. Best ₹249 spent this year!',
    },
    {
      bookSlug: 'scalable-wealth-compounding',
      userEmail: 'prince@ebookvala.com',
      rating: 5,
      comment: 'The asymmetric risk management section is gold. Transformed how I think about portfolio allocations.',
    },
    {
      bookSlug: 'zero-to-one-million-users',
      userEmail: 'prince@ebookvala.com',
      rating: 5,
      comment: 'Packed with actionable growth tactics. Bhanderi Prince provides real-world frameworks instead of generic advice.',
    },
  ];

  for (const r of reviewsData) {
    const user = r.userEmail === 'prince@ebookvala.com' ? user1 : r.userEmail === 'bhanderi@ebookvala.com' ? user2 : user3;
    const bookId = seededBooks[r.bookSlug];
    if (user && bookId) {
      await prisma.review.upsert({
        where: {
          userId_bookId: {
            userId: user.id,
            bookId: bookId,
          },
        },
        update: { rating: r.rating, comment: r.comment },
        create: {
          rating: r.rating,
          comment: r.comment,
          userId: user.id,
          bookId: bookId,
        },
      });
    }
  }
  console.log('✅ Seeded Sample Reviews');

  // 6. Seed Sample Promo Codes
  const promoCodes = [
    { code: 'EBOOK20', discountType: 'PERCENT', discountValue: 20, minOrderAmount: 0, maxUses: 50, isActive: true },
    { code: 'WELCOME50', discountType: 'FLAT', discountValue: 50, minOrderAmount: 100, maxUses: 100, isActive: true },
    { code: 'EXPIRED10', discountType: 'PERCENT', discountValue: 10, minOrderAmount: 0, maxUses: 10, expiresAt: new Date(Date.now() - 86400000), isActive: true },
    { code: 'MAXEDOUT', discountType: 'PERCENT', discountValue: 30, minOrderAmount: 0, maxUses: 1, usedCount: 1, isActive: true },
  ];

  for (const promo of promoCodes) {
    await prisma.promoCode.upsert({
      where: { code: promo.code },
      update: promo,
      create: promo,
    });
  }
  console.log('✅ Seeded Sample Promo Codes');

  // 7. Seed Chapters for 5 Books (10 chapters each) & Grant Purchases for Test User
  const targetBookSlugs = [
    'psychology-of-money-mastery',
    'mastering-digital-mindset-ai',
    'zero-to-one-founder-playbook',
    'dopamine-reset-motivation',
    'modern-system-design-interview',
  ];

  const chapterTitlesTemplate = [
    'Introduction: The Foundation & Core Principles',
    'Chapter 1: Deconstructing Modern Myths',
    'Chapter 2: The Mental Framework of High Performers',
    'Chapter 3: Strategic Execution Under Pressure',
    'Chapter 4: Navigating Complexity & Chaos',
    'Chapter 5: Compounding Marginal Gains Over Time',
    'Chapter 6: Behavioral Patterns & Cognitive Biases',
    'Chapter 7: Building Resilient Long-Term Systems',
    'Chapter 8: Case Studies & Real-World Synthesis',
    'Chapter 9: The Future Landscape & Next Horizons',
  ];

  for (const slug of targetBookSlugs) {
    const bookId = seededBooks[slug];
    if (bookId) {
      for (let i = 0; i < chapterTitlesTemplate.length; i++) {
        const order = i + 1;
        const title = chapterTitlesTemplate[i];
        const content = `
          <h2>${title}</h2>
          <p>Welcome to ${title}. In this section, we dive deep into the fundamental concepts that shape modern performance, strategic thinking, and continuous self-improvement.</p>
          <p>Success is rarely the result of sudden breakthroughs or overnight luck. Instead, it is built through the disciplined accumulation of small, intelligent choices made consistently over time. When you analyze industry pioneers, top developers, and visionary founders, a common pattern emerges: they optimize for clarity, focus on first principles, and eliminate unnecessary friction.</p>
          <blockquote>"The secret to long-term progress is not extraordinary intelligence, but relentless consistency in fundamentals."</blockquote>
          <p>Consider how decision-making changes when you remove emotional noise. By establishing structured mental models, you transition from reactive choices to proactive strategy. This chapter breaks down practical steps you can implement today to elevate your everyday output.</p>
          <p>As you progress through these pages, reflect on how these principles apply to your current projects, career goals, and daily routine. Take notes, highlight key takeaways, and test these insights in real-world scenarios.</p>
        `.trim();

        await prisma.chapter.upsert({
          where: { id: `chap_${slug}_${order}` },
          update: { title, content, wordCount: 350 },
          create: {
            id: `chap_${slug}_${order}`,
            bookId,
            order,
            title,
            content,
            wordCount: 350,
          },
        });
      }

      if (user1) {
        const dummyOrder = await prisma.order.upsert({
          where: { razorpayOrderId: `order_seed_${slug}` },
          update: {},
          create: {
            userId: user1.id,
            razorpayOrderId: `order_seed_${slug}`,
            status: 'PAID',
            amount: 19900,
            currency: 'INR',
          },
        });

        await prisma.purchase.upsert({
          where: {
            userId_bookId: {
              userId: user1.id,
              bookId,
            },
          },
          update: {},
          create: {
            userId: user1.id,
            bookId,
            orderId: dummyOrder.id,
          },
        });
      }
    }
  }

  console.log('✅ Seeded 10 Chapters & Purchase Grants for 5 Books');

  // 6. Seed Achievements & User Achievements
  const achievementsData = [
    {
      key: 'FIRST_BOOK_PURCHASED',
      title: 'First Book Purchased',
      description: 'Acquired your very first eBook on EbookVala.',
      iconName: 'ShoppingBag',
      criteriaDescription: 'Purchase 1 eBook from the Book Store.',
    },
    {
      key: 'FIRST_BOOK_FINISHED',
      title: 'First Book Finished',
      description: 'Completed reading an entire eBook 100%.',
      iconName: 'CheckCircle',
      criteriaDescription: 'Reach 100% completion on any purchased book.',
    },
    {
      key: '3_DAY_STREAK',
      title: '3-Day Streak',
      description: 'Read consistently for 3 consecutive days.',
      iconName: 'Flame',
      criteriaDescription: 'Maintain a 3-day active reading streak.',
    },
    {
      key: '7_DAY_STREAK',
      title: '7-Day Streak',
      description: 'Maintained an active reading habit for a full week.',
      iconName: 'Zap',
      criteriaDescription: 'Maintain a 7-day active reading streak.',
    },
    {
      key: '30_DAY_STREAK',
      title: '30-Day Streak',
      description: 'Mastered daily reading consistency for a full month.',
      iconName: 'Award',
      criteriaDescription: 'Maintain a 30-day active reading streak.',
    },
    {
      key: '10_BOOKS_LIBRARY',
      title: '10 Books in Library',
      description: 'Built a personal digital library of 10 or more eBooks.',
      iconName: 'Library',
      criteriaDescription: 'Own 10 eBooks in your personal library.',
    },
    {
      key: '50_HOURS_READ',
      title: '50 Hours Read',
      description: 'Accumulated over 50 hours of deep reading.',
      iconName: 'Clock',
      criteriaDescription: 'Log 50+ total reading hours across books.',
    },
    {
      key: 'FIRST_HIGHLIGHT_MADE',
      title: 'First Highlight Made',
      description: 'Highlighted key text and saved your first note.',
      iconName: 'Highlighter',
      criteriaDescription: 'Create 1 text highlight or note in the reader.',
    },
    {
      key: 'FIRST_REVIEW_WRITTEN',
      title: 'First Review Written',
      description: 'Shared your valuable rating & review with the community.',
      iconName: 'Star',
      criteriaDescription: 'Publish a review on any finished eBook.',
    },
  ];

  const achievementMap: Record<string, string> = {};

  for (const ach of achievementsData) {
    const createdAch = await prisma.achievement.upsert({
      where: { key: ach.key },
      update: {
        title: ach.title,
        description: ach.description,
        iconName: ach.iconName,
        criteriaDescription: ach.criteriaDescription,
      },
      create: ach,
    });
    achievementMap[ach.key] = createdAch.id;
  }

  if (user1) {
    // Unlock a subset of achievements for test user prince@ebookvala.com
    const unlockedKeys = ['FIRST_BOOK_PURCHASED', 'FIRST_BOOK_FINISHED', '3_DAY_STREAK', 'FIRST_HIGHLIGHT_MADE', 'FIRST_REVIEW_WRITTEN'];
    for (const key of unlockedKeys) {
      const achId = achievementMap[key];
      if (achId) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: user1.id,
              achievementId: achId,
            },
          },
          update: {},
          create: {
            userId: user1.id,
            achievementId: achId,
            unlockedAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
          },
        });
      }
    }

    // Seed Notification Preference for test user
    await prisma.notificationPreference.upsert({
      where: { userId: user1.id },
      update: {},
      create: {
        userId: user1.id,
        emailNewReleases: true,
        emailReadingReminders: true,
        emailPromotions: false,
        emailOrderReceipts: true,
        pushEnabled: true,
      },
    });
  }

  console.log('✅ Seeded Achievements & User Achievement Grants');
  console.log('🎉 EbookVala Phase 6 Database Seeding Complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding Error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
