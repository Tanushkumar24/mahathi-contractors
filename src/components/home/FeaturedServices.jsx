import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Home, Paintbrush, Droplets, Zap, Sofa, Hammer, Grid3X3, Shield } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import GlassCard from '../shared/GlassCard';

const services = [
  { name: 'House Construction', icon: Home, desc: 'Premium residential construction with modern techniques', slug: 'house-construction' },
  { name: 'Interior Design', icon: Sofa, desc: 'Transform spaces with elegant & functional interiors', slug: 'interior-design' },
  { name: 'Painting', icon: Paintbrush, desc: 'Professional interior & exterior painting services', slug: 'painting' },
  { name: 'Waterproofing', icon: Droplets, desc: 'Complete waterproofing solutions for lasting protection', slug: 'waterproofing' },
  { name: 'Electrical Works', icon: Zap, desc: 'Smart wiring, lighting, solar & CCTV installations', slug: 'electrical' },
  { name: 'Flooring', icon: Grid3X3, desc: 'Premium tiles, granite, marble & wooden flooring', slug: 'flooring' },
  { name: 'Civil Works', icon: Hammer, desc: 'Foundation, RCC, plastering & structural work', slug: 'civil-works' },
  { name: 'Smart Home', icon: Shield, desc: 'Smart locks, EV chargers, home theatre & automation', slug: 'smart-home' },
];

export default function FeaturedServices() {
  return (
    <section className="py-24 relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          label="Our Services"
          title="What We Build"
          description="From foundation to finishing — complete construction & renovation solutions"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((service, i) => (
            <GlassCard key={service.slug} delay={i * 0.05}>
              <Link to={`/services`} className="block group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <service.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 font-heading">{service.name}</h3>
                <p className="text-sm text-white/40 leading-relaxed mb-4">{service.desc}</p>
                <div className="flex items-center gap-1 text-sm text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            </GlassCard>
          ))}
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Link to="/services" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium transition-colors text-sm group">
            View All Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}