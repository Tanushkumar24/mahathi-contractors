import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, ArrowRight } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';

const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Villa', 'Renovation'];

const projects = [
  { title: 'Modern Villa - Jubilee Hills', category: 'Villa', location: 'Jubilee Hills, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80', budget: '₹1.2 Cr', area: '3,500 sqft' },
  { title: '3BHK Premium Apartment', category: 'Residential', location: 'Gachibowli, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80', budget: '₹85 Lakhs', area: '1,800 sqft' },
  { title: 'Corporate Office Space', category: 'Commercial', location: 'HITEC City, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&q=80', budget: '₹2.5 Cr', area: '5,000 sqft' },
  { title: 'Luxury Penthouse Interior', category: 'Interior', location: 'Banjara Hills, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80', budget: '₹40 Lakhs', area: '2,200 sqft' },
  { title: 'Duplex Home', category: 'Residential', location: 'Kondapur, Hyderabad', status: 'ongoing', image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80', budget: '₹95 Lakhs', area: '2,400 sqft' },
  { title: 'Modern Kitchen Makeover', category: 'Renovation', location: 'Miyapur, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80', budget: '₹8 Lakhs', area: '150 sqft' },
  { title: 'Independent House', category: 'Residential', location: 'Kukatpally, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80', budget: '₹75 Lakhs', area: '2,000 sqft' },
  { title: 'Boutique Hotel', category: 'Commercial', location: 'Secunderabad', status: 'ongoing', image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80', budget: '₹4 Cr', area: '8,000 sqft' },
  { title: 'Smart Villa', category: 'Villa', location: 'Shamshabad, Hyderabad', status: 'completed', image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', budget: '₹1.8 Cr', area: '4,200 sqft' },
];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="pt-24">
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            label="Portfolio"
            title="Our Projects"
            description="Explore our portfolio of completed and ongoing construction projects"
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

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -5 }}
                className="glass rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-transparent to-transparent" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      project.status === 'completed'
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    }`}>
                      {project.status === 'completed' ? 'Completed' : 'Ongoing'}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white font-heading mb-2">{project.title}</h3>
                  <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
                    <MapPin className="w-3 h-3" /> {project.location}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-400 font-medium">{project.budget}</span>
                    <span className="text-white/30">{project.area}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}