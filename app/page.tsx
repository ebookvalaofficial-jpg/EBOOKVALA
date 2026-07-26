'use client';

import React, { useEffect } from 'react';
import Lenis from 'lenis';

import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import CategoriesGrid from '@/components/landing/CategoriesGrid';
import TrendingBooks from '@/components/landing/TrendingBooks';
import MeetOurTeam from '@/components/landing/MeetOurTeam';
import ReadingExperience from '@/components/landing/ReadingExperience';
import FeaturesGrid from '@/components/landing/FeaturesGrid';
import Testimonials from '@/components/landing/Testimonials';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTASection from '@/components/landing/CTASection';
import Footer from '@/components/landing/Footer';
import { trackPageView } from '@/lib/analytics';

export default function Home() {
  // Smooth Scrolling setup via Lenis
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    (window as any).__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
    trackPageView('/');

    return () => {
      delete (window as any).__lenis;
      lenis.destroy();
    };
  }, []);

  return (
    <main className="min-h-screen bg-theme-bg text-theme-body font-inter relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      <Navbar />
      <Hero />
      <CategoriesGrid />
      <TrendingBooks />
      <MeetOurTeam />
      <ReadingExperience />
      <FeaturesGrid />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
