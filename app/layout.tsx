import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Providers } from '@/components/Providers';
import PwaInitializer from '@/components/pwa/PwaInitializer';
import OfflineIndicator from '@/components/pwa/OfflineIndicator';
import UpdateAvailableBanner from '@/components/pwa/UpdateAvailableBanner';
import InstallPrompt from '@/components/pwa/InstallPrompt';
import MobileBottomNav from '@/components/landing/MobileBottomNav';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#F59E0B',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const montserrat = { variable: 'font-montserrat' };
const inter = { variable: 'font-inter' };
const spaceGrotesk = { variable: 'font-space-grotesk' };
const eduHand = { variable: 'font-edu-hand' };
const merriweather = { variable: 'font-merriweather' };

export const metadata: Metadata = {
  title: 'EbookVala — Next-Gen eBook Marketplace & AI Reading Platform',
  description: 'Explore thousands of premium eBooks in Coding, Business, AI, Finance, & Self Improvement. Enhanced with AI Chat with Book, instant summaries, audiobooks & cloud sync.',
  manifest: '/manifest.json',
  keywords: [
    'buy ebooks online',
    'read books online India',
    'best ebook platform',
    'AI book reader',
    'EbookVala',
    'coding ebooks',
    'business books',
    'self help books',
    'audiobooks India'
  ],
  authors: [{ name: 'Prince Gajera' }, { name: 'Bhanderi Prince' }],
  creator: 'EbookVala Team',
  metadataBase: new URL('https://ebookvala.com'),
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'EbookVala — Next-Gen eBook Marketplace & AI Reading Platform',
    description: 'Stop Scrolling. Start Growing. Discover thousands of handpicked eBooks with AI Chat, smart summaries, audiobooks, and seamless multi-device sync.',
    url: 'https://ebookvala.com',
    siteName: 'EbookVala',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 800,
        alt: 'EbookVala Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EbookVala — Next-Gen eBook Marketplace & AI Reading Platform',
    description: 'Unlock unlimited knowledge with thousands of eBooks, AI Chat, and smart reading tools.',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLdSchemas = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://ebookvala.com/#organization',
      name: 'EbookVala',
      url: 'https://ebookvala.com',
      logo: 'https://ebookvala.com/logo.png',
      sameAs: [
        'https://twitter.com/ebookvala',
        'https://linkedin.com/company/ebookvala'
      ],
      founders: [
        { '@type': 'Person', name: 'Prince Gajera' },
        { '@type': 'Person', name: 'Bhanderi Prince' }
      ]
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ebookvala.com/#website',
      url: 'https://ebookvala.com',
      name: 'EbookVala',
      description: 'Next-Gen eBook Marketplace & AI Reading Platform',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://ebookvala.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    },
    {
      '@type': 'Product',
      name: 'EbookVala Plus Subscription',
      description: 'Unlimited eBook library access with AI Chat, AI Summaries, Flashcards, and Multi-device Sync',
      offers: {
        '@type': 'Offer',
        price: '180',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
        url: 'https://ebookvala.com/#pricing'
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const clarityId = process.env.NEXT_PUBLIC_CLARITY_ID;

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${montserrat.variable} ${inter.variable} ${spaceGrotesk.variable} ${eduHand.variable} ${merriweather.variable}`}>
      <head>
        <meta name="theme-color" content="#F59E0B" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Edu+VIC+WA+NT+Hand:wght@400..700&family=Inter:wght@100..900&family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&family=Montserrat:wght@100..900&family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchemas) }}
        />

        {/* Conditional Google Analytics 4 */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}');
              `}
            </Script>
          </>
        )}

        {/* Conditional Microsoft Clarity */}
        {clarityId && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${clarityId}");
            `}
          </Script>
        )}
      </head>
      <body className="antialiased min-h-screen bg-theme-bg text-theme-body selection:bg-blue-600 selection:text-white pb-16 md:pb-0">
        <Providers>
          <PwaInitializer />
          <OfflineIndicator />
          <UpdateAvailableBanner />
          <InstallPrompt />
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
