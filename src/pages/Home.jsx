import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Home as HomeIcon, Wind, ShieldCheck } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import MarqueeBanner from '../components/home/MarqueeBanner';
import FeaturedServices from '../components/home/FeaturedServices';
import BeforeAfterSection from '../components/home/BeforeAfterSection';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import CTASection from '../components/home/CTASection';

export default function Home() {
  const planningPoints = [
    { icon: Compass, title: 'Site Direction', text: 'Planning that respects site orientation, entry placement, and everyday movement.' },
    { icon: HomeIcon, title: 'Family Spaces', text: 'Practical room layouts for privacy, comfort, storage, and future expansion.' },
    { icon: Wind, title: 'Light and Ventilation', text: 'Better airflow, natural light, and comfortable daily-use spaces.' },
    { icon: ShieldCheck, title: 'Modern Execution', text: 'Traditional preferences combined with quality materials and clean finishing.' },
  ];

  return (
    <div>
      <HeroSection />
      <StatsSection />
      <MarqueeBanner />
      <FeaturedServices />
      <section className="border-y border-white/5 bg-gradient-to-br from-[#0B1220] via-[#0E1726] to-[#101318] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.3fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Vastu-Friendly Planning</p>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
                Traditional values with practical modern home design
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/50">
                We respect your family preferences, site direction, pooja room placement, ventilation, and practical daily-use planning while designing your home.
              </p>
            </motion.div>
            <div className="grid gap-4 sm:grid-cols-2">
              {planningPoints.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.06 }}
                  className="glass rounded-2xl p-5 transition hover:-translate-y-1 hover:border-amber-400/25"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
                    <item.icon className="h-5 w-5 text-amber-300" />
                  </div>
                  <h3 className="font-heading text-base font-semibold text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <BeforeAfterSection />
      <ReviewsCarousel />
      <CTASection />
    </div>
  );
}
