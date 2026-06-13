import React from 'react';
import { motion } from 'framer-motion';
import { Award, Compass, Home as HomeIcon, UserCheck, Wind, ShieldCheck } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import MarqueeBanner from '../components/home/MarqueeBanner';
import FeaturedServices from '../components/home/FeaturedServices';
import BeforeAfterSection from '../components/home/BeforeAfterSection';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import CTASection from '../components/home/CTASection';
import SEO from '@/components/SEO';

export default function Home() {
  const planningPoints = [
    { icon: Compass, title: 'Site Direction', text: 'Planning that respects site orientation, entry placement, and everyday movement.' },
    { icon: HomeIcon, title: 'Family Spaces', text: 'Practical room layouts for privacy, comfort, storage, and future expansion.' },
    { icon: Wind, title: 'Light and Ventilation', text: 'Better airflow, natural light, and comfortable daily-use spaces.' },
    { icon: ShieldCheck, title: 'Modern Execution', text: 'Traditional preferences combined with quality materials and clean finishing.' },
  ];

  return (
    <div>
      <SEO
        title="Mahathi Building Contractors | Construction Company in Vijayawada"
        description="Mahathi Building Contractors provides house construction, renovation, interiors, painting, plumbing, electrical, waterproofing, civil works, and maintenance services in Vijayawada and Andhra Pradesh."
        canonical="https://mahathicontractors.in/"
      />
      <HeroSection />
      <StatsSection />
      <section className="border-b border-white/5 bg-[#090D16] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Led by Experience</p>
              <h2 className="font-heading text-3xl font-bold leading-tight text-white md:text-4xl">
                Personal supervision from Simhadri Sampath Kumar
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/50">
                Mahathi Building Contractors is led by Simhadri Sampath Kumar, Founder & Sole Proprietor, with 20+ years of hands-on experience in civil works, residential construction, renovations, interiors, and site execution.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.55 }} className="glass rounded-2xl p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-blue-600 font-heading text-2xl font-bold text-white">
                  SS
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-white">Simhadri Sampath Kumar</h3>
                  <p className="mt-1 text-sm font-semibold text-amber-300">Founder & Sole Proprietor</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60"><Award className="h-3.5 w-3.5 text-amber-300" /> 20+ years experience</span>
                    <span className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60"><UserCheck className="h-3.5 w-3.5 text-blue-300" /> Direct project guidance</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
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
