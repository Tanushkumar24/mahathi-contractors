import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Phone, MessageCircle, Calendar, ClipboardList, ShieldCheck, Clock, IndianRupee, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const quickServices = [
  'House Construction', 'Renovation Works', 'Painting Works',
  'Interior Works', 'Epoxy Flooring', 'Electrical Works', 'Plumbing Works', 'Civil Contracting',
];

const trustPoints = [
  { icon: ShieldCheck, label: 'Quality materials' },
  { icon: Clock, label: 'On-time handover' },
  { icon: IndianRupee, label: 'Transparent pricing' },
  { icon: Building2, label: 'Residential and commercial' },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A] via-[#0F1629] to-[#0A0E1A]" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-medium text-blue-400 tracking-wide">Mahathi Contractors - Since 2020</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white font-heading leading-[1.05] tracking-tight"
            >
              Today Under
              <br />
              <span className="text-gradient">Construction.</span>
              <br />
              <span className="text-white/90">Tomorrow Your Dream Home.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base md:text-lg text-white/40 mt-6 max-w-lg leading-relaxed"
            >
              Professional construction, renovation, repairs, interiors, and maintenance for residential and commercial spaces.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-3 mt-8"
            >
              <Link to="/book">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-2xl px-6 h-12 text-sm font-semibold shadow-2xl shadow-blue-500/25 gap-2 group">
                  <Calendar className="w-4 h-4" /> Book Now
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/book">
                <Button size="lg" variant="outline" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-2xl px-6 h-12 text-sm font-semibold gap-2">
                  <ClipboardList className="w-4 h-4" /> Book Site Visit
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-green-500/30 text-green-400 hover:bg-green-500/10 rounded-2xl px-6 h-12 text-sm font-semibold gap-2">
                  <MessageCircle className="w-4 h-4" /> Get Free Quote
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-2 gap-3 sm:max-w-xl"
            >
              {trustPoints.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-white/70">
                  <item.icon className="h-4 w-4 text-blue-400" />
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>


          </div>

          {/* Right - Services + Contact */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            {/* Services Grid */}
            <div className="glass rounded-2xl p-5 mb-4">
              <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Our Services</p>
              <div className="grid grid-cols-2 gap-2">
                {quickServices.map((s) => (
                  <Link key={s} to="/services" className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/3 border border-white/5 hover:bg-blue-500/10 hover:border-blue-500/20 transition-all group">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400/60 group-hover:bg-blue-400 transition-colors" />
                    <span className="text-xs text-white/60 group-hover:text-white transition-colors">{s}</span>
                  </Link>
                ))}
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
