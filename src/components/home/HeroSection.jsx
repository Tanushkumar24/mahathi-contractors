import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MessageCircle, Calendar, ClipboardList, ShieldCheck, Clock, IndianRupee, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const trustPoints = [
  { icon: ShieldCheck, label: 'Quality materials' },
  { icon: Clock, label: 'On-time handover' },
  { icon: IndianRupee, label: 'Transparent pricing' },
  { icon: Building2, label: 'Residential and commercial' },
];

const heroStats = [
  ['Since', '2020'],
  ['Completed services', '150+'],
  ['Founder experience', '20+ yrs'],
];

export default function HeroSection() {
  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden lg:min-h-screen">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#090B10] via-[#111827] to-[#0B1220]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 pb-14 pt-28 sm:px-6 sm:pt-32 lg:px-8 lg:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-2 sm:mb-8 sm:px-4"
            >
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse" />
              <span className="text-xs font-medium text-amber-200 tracking-wide">Mahathi Building Contractors - Since 2020</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-[2.35rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              Trusted construction
              <br className="hidden sm:block" />
              <span className="text-gradient">for Vijayawada homes.</span>
              <br className="hidden sm:block" />
              <span className="text-white/90">Built with care.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-5 max-w-lg text-sm leading-7 text-white/45 sm:text-base md:text-lg"
            >
              Residential construction, renovation, interiors, painting, plumbing, electrical, waterproofing, and maintenance with transparent pricing and reliable handover.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-7 grid gap-3 sm:flex sm:flex-wrap"
            >
              <Link to="/book">
                <Button size="lg" className="group h-12 w-full rounded-2xl border-0 bg-gradient-to-r from-blue-600 to-blue-500 px-6 text-sm font-semibold text-white shadow-2xl shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 sm:w-auto">
                  <Calendar className="w-4 h-4" /> Book Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/book">
                <Button size="lg" variant="outline" className="h-12 w-full rounded-2xl border-white/10 px-6 text-sm font-semibold text-white/70 hover:bg-white/5 hover:text-white sm:w-auto">
                  <ClipboardList className="w-4 h-4" /> Book Site Visit
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="h-12 w-full rounded-2xl border-green-500/30 px-6 text-sm font-semibold text-green-400 hover:bg-green-500/10 sm:w-auto">
                  <MessageCircle className="w-4 h-4" /> Get Free Quote
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="mt-7 grid max-w-xl grid-cols-3 gap-2 sm:gap-3"
            >
              {heroStats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 sm:p-4">
                  <p className="text-base font-bold text-white sm:text-lg md:text-2xl">{value}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/40">{label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-7 grid grid-cols-1 gap-2 sm:max-w-xl sm:grid-cols-2 sm:gap-3"
            >
              {trustPoints.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/70">
                  <item.icon className="h-4 w-4 text-amber-300" />
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>


          </div>

          {/* Right - Project Visual + Contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="glass rounded-2xl p-3 mb-4">
              <div className="relative h-[430px] overflow-hidden rounded-xl">
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&q=85"
                  alt="Premium residential construction"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070A12] via-[#070A12]/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">Residential and commercial</p>
                  <h2 className="mt-2 max-w-sm font-heading text-2xl font-bold text-white">Modern planning with traditional construction values</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">Vastu-friendly layouts, practical ventilation, quality materials, and family-focused spaces.</p>
                </div>
              </div>
            </div>

            {/* Contact Card */}
            <div className="glass rounded-2xl p-5">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Quick Contact</p>
              <div className="space-y-2">
                <a href="tel:+918688074469" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><Phone className="w-4 h-4 text-blue-400" /></div>
                  <div><p className="text-xs text-white/30">Call Now</p><p className="text-sm font-medium text-white">8688074469</p></div>
                </a>
                <a href="https://wa.me/918688074469" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-green-400" /></div>
                  <div><p className="text-xs text-white/30">WhatsApp</p><p className="text-sm font-medium text-white">8688074469</p></div>
                </a>
                <div className="flex items-center gap-3 p-3 rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center"><span className="text-purple-400 text-xs">@</span></div>
                  <div><p className="text-xs text-white/30">Email</p><p className="text-xs font-medium text-white">mahathicontractors@gmail.com</p></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
