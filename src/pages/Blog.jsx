import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';

const categories = ['All', 'Construction Tips', 'House Planning', 'Interior Design', 'Vastu', 'Waterproofing', 'Smart Home'];

const blogPosts = [
  { title: '10 Things to Check Before Starting House Construction', category: 'Construction Tips', excerpt: 'Planning to build your dream home? Here are the essential checklist items every homeowner should verify before breaking ground.', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80', date: 'Nov 15, 2024', readTime: '5 min' },
  { title: 'Complete Guide to 2BHK & 3BHK Floor Plans', category: 'House Planning', excerpt: 'Optimize your living space with smart floor plan designs. Learn about Vastu-compliant layouts for Indian homes.', image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', date: 'Nov 10, 2024', readTime: '8 min' },
  { title: 'Modern Interior Design Trends for 2025', category: 'Interior Design', excerpt: 'From minimalist Japanese-inspired interiors to smart home integration, discover what\'s trending in home interiors.', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80', date: 'Nov 5, 2024', readTime: '6 min' },
  { title: 'Vastu Tips for a Prosperous Home', category: 'Vastu', excerpt: 'Ancient wisdom meets modern architecture. Learn how to incorporate Vastu principles into your new home design.', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', date: 'Oct 28, 2024', readTime: '7 min' },
  { title: 'Why Terrace Waterproofing is Non-Negotiable', category: 'Waterproofing', excerpt: 'Leaking terraces can cause serious structural damage. Learn about modern waterproofing solutions and their benefits.', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80', date: 'Oct 20, 2024', readTime: '4 min' },
  { title: 'Smart Home Setup Guide: From Basics to Advanced', category: 'Smart Home', excerpt: 'Transform your home with smart locks, automated lighting, security cameras, and voice-controlled systems.', image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&q=80', date: 'Oct 15, 2024', readTime: '10 min' },
  { title: 'How to Choose the Right Flooring Material', category: 'Construction Tips', excerpt: 'Tiles vs granite vs marble vs wooden — a comprehensive comparison to help you pick the perfect flooring for each room.', image: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=600&q=80', date: 'Oct 10, 2024', readTime: '6 min' },
  { title: 'Budget Planning for House Construction in 2025', category: 'House Planning', excerpt: 'A detailed cost breakdown for building a home in Hyderabad — from land to finishing, know exactly what to expect.', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80', date: 'Oct 5, 2024', readTime: '9 min' },
];

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(p => p.category === activeCategory);

  return (
    <div className="pt-24">
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            label="Blog"
            title="Construction Insights & Tips"
            description="Expert advice on building, design, and maintaining your dream home"
          />

          {/* Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Blog Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post, i) => (
              <motion.article
                key={post.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent" />
                  <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {post.category}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-white/30 mb-3">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {post.date}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime} read</span>
                  </div>
                  <h3 className="text-base font-semibold text-white font-heading mb-2 group-hover:text-blue-400 transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-2">{post.excerpt}</p>
                  <span className="text-xs text-blue-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    Read More <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}