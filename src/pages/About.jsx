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
  { year: '2020', title: 'Founded', desc: 'Mahathi Building Contractors was established in Vijayawada with a vision to deliver trusted, high-quality, and modern construction services.' },
  { year: '2021', title: 'Residential Projects', desc: 'Started serving families with residential construction, renovation, and civil works across Vijayawada and nearby areas.' },
  { year: '2022', title: 'Interior & Maintenance Services', desc: 'Expanded into interior works, painting, electrical, plumbing, waterproofing, and complete home maintenance services.' },
  { year: '2023', title: 'Modern Construction Solutions', desc: 'Strengthened project planning, premium finishing, practical layouts, and customer-focused execution.' },
  { year: '2024', title: 'Trusted Local Growth', desc: 'Built a stronger local reputation through residential projects, renovation works, and maintenance services.' },
  { year: '2025', title: '150+ Completed Services', desc: 'Reached 150+ completed construction, renovation, and maintenance services with strong customer satisfaction.' },
  { year: '2026', title: 'Premium Construction Vision', desc: 'Continuing to grow as a trusted construction partner with modern design, vastu-friendly planning, transparent pricing, and on-time execution.' },
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
              Mahathi Building Contractors was founded in Vijayawada in 2020, led by a founder with over two decades of hands-on construction experience. We combine trusted workmanship, modern planning, and transparent execution to deliver quality construction, renovation, interiors, and maintenance services.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <AnimatedCounter end={20} suffix="+" label="Founder Experience" icon={Clock} />
            <AnimatedCounter end={100} suffix="+" label="Happy Customers" icon={Users} />
            <AnimatedCounter end={150} suffix="+" label="Completed Services" icon={Building2} />
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

      {/* Founder */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Led by Experience</p>
              <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">Founder & Sole Proprietor</h2>
              <p className="mt-4 text-sm leading-7 text-white/50">
                Mahathi Building Contractors is led by Simhadri Sampath Kumar, Founder & Sole Proprietor, who brings over 20 years of practical construction experience in civil works, residential projects, renovations, interiors, and site execution. His focus is on quality workmanship, transparent communication, and reliable project completion.
              </p>
            </motion.div>
            <GlassCard hover={false}>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-blue-600 text-3xl font-bold text-white shadow-2xl shadow-blue-950/40">
                  SS
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-blue-300">Founder Profile</p>
                  <h3 className="mt-2 font-heading text-2xl font-bold text-white">Simhadri Sampath Kumar</h3>
                  <p className="mt-1 text-sm font-semibold text-amber-300">Founder & Sole Proprietor</p>
                  <div className="mt-4 grid gap-2 sm:grid-cols-3">
                    {['20+ years experience', 'Civil works expertise', 'Reliable site execution'].map((item) => (
                      <span key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">{item}</span>
                    ))}
                  </div>
                </div>
              </div>
            </GlassCard>
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
