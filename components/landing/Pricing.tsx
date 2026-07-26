'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { pricingTiers, featureComparisonMatrix } from '@/data/pricing';
import { trackCTAClick } from '@/lib/analytics';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-24 bg-theme-bg relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-primary-blue bg-blue-500/10 px-3.5 py-1.5 rounded-full inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" /> Transparent INR Pricing
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-theme-heading font-montserrat mt-4 mb-4">
            Invest in Your Mind. Choose Your Plan.
          </h2>
          <p className="text-base sm:text-lg text-theme-body">
            Flexible pricing tailored for students, avid readers, and high-performance teams. Cancel anytime.
          </p>
        </div>

        {/* Monthly / Yearly Animated Toggle */}
        <div className="flex items-center justify-center mb-16">
          <div className="bg-theme-card border border-theme p-1.5 rounded-2xl flex items-center gap-3 shadow-md glass-card">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                !isYearly
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                isYearly
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-theme-muted hover:text-theme-heading'
              }`}
            >
              <span>Yearly Billing</span>
              <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* 5 Pricing Tiers Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-6">
          {pricingTiers.map((tier, idx) => {
            const price = isYearly ? tier.yearlyPriceMonthly : tier.monthlyPrice;
            const isPopular = tier.popular;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                whileHover={{ y: -8 }}
                className={`relative rounded-3xl p-6 border shadow-xl glass-card flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? 'border-blue-500 bg-gradient-to-b from-blue-600/10 via-theme-card to-theme-card ring-2 ring-blue-500 shadow-blue-500/20'
                    : 'border-theme bg-theme-card'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 fill-white" /> Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-black text-theme-heading font-montserrat mb-1">
                    {tier.name}
                  </h3>
                  <p className="text-xs text-theme-muted line-clamp-2 mb-6">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-theme-heading font-stats">
                      ₹{price}
                    </span>
                    <span className="text-xs text-theme-muted font-medium">/month</span>
                  </div>

                  {/* Feature Checklist */}
                  <ul className="space-y-3 mb-8">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-xs text-theme-body">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#cta"
                  onClick={() => trackCTAClick(tier.ctaText, `Pricing - ${tier.name}`)}
                  className={`w-full py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isPopular
                      ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-theme-heading border border-theme'
                  }`}
                >
                  {tier.ctaText}
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.a>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
