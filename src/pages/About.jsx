import React from 'react';
import { motion } from 'framer-motion';
import { Award, Shield, Users, Target, CheckCircle, Building2, Clock, Heart } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import GlassCard from '../components/shared/GlassCard';

const values = [
  { icon: Shield, title: 'Premium Quality', desc: 'Only the finest materials and superior craftsmanship go into every project we undertake.' },
  { icon: Users, title: 'Transparent Communication', desc: 'Real-time updates, honest pricing, and clear timelines throughout your project journey.' },
  { icon: Target, title: 'On-Time Delivery', desc: 'We respect your time. Our projects are planned meticulously to meet every deadline.' },
  { icon: Heart, title: 'Customer First', desc: 'Your satisfaction is our priority. We go above and beyond to exceed expectations.' },
];

const milestones = [
  { year: '2004', title: 'Founded', desc: 'MBC established in Vijayawada with a vision for premium construction' },
  { year: '2010', title: '100 Projects', desc: 'Milestone of 100 successfully completed residential projects' },
  { year: '2016', title: 'Interior Division', desc: 'Expanded into full interior design and modular kitchen services' },
  { year: '2020', title: 'Smart Home', desc: 'Introduced smart home automation and modern tech solutions' },
  { year: '2024', title: '500+ Services', desc: 'Reached 500+ completed services with 4.9-star rating' },
];

const team = [
  { name: 'Simhadri Sampath Kumar', role: 'Founder & Sole Proprietor', desc: '20+ years of expertise in construction management, project delivery, and client relations.' },
  { name: 'Engineering Team', role: 'Project Execution', desc: '50+ skilled engineers, supervisors, and site managers ensuring quality at every stage.' },
  { name: 'Design Team', role: 'Interior & Architecture', desc: 'Creative professionals delivering functional and beautiful spaces tailored to client needs.' },
];

export default function About() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-4 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
              About MBC
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white font-heading leading-tight">
              20+ Years of Building <span className="text-gradient">Excellence</span>
            </h1>
            <p className="text-lg text-white/40 mt-6 leading-relaxed">
              Mahathi Building Contractors has been transforming dreams into structures since 2004. We combine traditional craftsmanship with modern technology to deliver premium construction experiences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter end={20} suffix="+" label="Years Experience" icon={Clock} />
            <AnimatedCounter end={100} suffix="+" label="Happy Customers" icon={Users} />
            <AnimatedCounter end={500} suffix="+" label="Completed Services" icon={Building2} />
            <AnimatedCounter end={50} suffix="+" label="Professional Workers" icon={Award} />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Our Values" title="Why Clients Choose Us" description="Core principles that drive every project we deliver" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <GlassCard key={i} delay={i * 0.08}>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <v.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2 font-heading">{v.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{v.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Our Journey" title="Milestones" />
          <div className="max-w-3xl mx-auto">
            {milestones.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex gap-6 mb-8 last:mb-0"
              >
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-400">{m.year}</span>
                  </div>
                  {i < milestones.length - 1 && <div className="w-px h-full bg-white/5 my-2" />}
                </div>
                <div className="pb-8">
                  <h3 className="text-lg font-semibold text-white font-heading">{m.title}</h3>
                  <p className="text-sm text-white/40 mt-1">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader label="Our Team" title="Led by Experts" description="A dedicated team of professionals committed to excellence" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {team.map((t, i) => (
              <GlassCard key={i} delay={i * 0.1}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-4 text-xl font-bold text-white">
                  {t.name.charAt(0)}
                </div>
                <h3 className="text-lg font-semibold text-white font-heading">{t.name}</h3>
                <p className="text-sm text-blue-400 mt-1">{t.role}</p>
                <p className="text-sm text-white/40 mt-2">{t.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}