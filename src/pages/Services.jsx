import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Paintbrush, Droplets, Zap, Sofa, Hammer, Grid3X3, Shield, ArrowRight, Ruler, Wrench } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';
import GlassCard from '../components/shared/GlassCard';
import api from '@/lib/api';

const categories = [
  'All', 'Construction', 'Design & Planning', 'Civil Works', 'Plumbing',
  'Electrical', 'Flooring', 'Painting', 'Interiors', 'Waterproofing', 'Smart Home'
];

const allServices = [
  { name: 'House Construction', slug: 'house-construction', category: 'Construction', icon: Home, desc: 'Custom residential homes built with premium materials and modern techniques' },
  { name: 'Duplex Construction', slug: 'duplex-construction', category: 'Construction', icon: Home, desc: 'Elegant duplex homes with optimized space utilization and modern design' },
  { name: 'Villa Construction', slug: 'villa-construction', category: 'Construction', icon: Home, desc: 'Luxury villas with world-class amenities and architectural excellence' },
  { name: 'Commercial Buildings', slug: 'commercial-buildings', category: 'Construction', icon: Home, desc: 'Commercial spaces designed for functionality and modern aesthetics' },
  { name: 'Interior Design', slug: 'interior-design', category: 'Design & Planning', icon: Ruler, desc: 'Complete interior design with 3D visualization and expert execution' },
  { name: 'Architecture Planning', slug: 'architecture-planning', category: 'Design & Planning', icon: Ruler, desc: '2D/3D floor plans, elevation designs, and structural planning' },
  { name: '3D Elevation', slug: '3d-elevation', category: 'Design & Planning', icon: Ruler, desc: 'Photorealistic 3D elevation renders for your dream home' },
  { name: 'Excavation & Foundation', slug: 'excavation-foundation', category: 'Civil Works', icon: Hammer, desc: 'Expert excavation and strong foundation work for lasting structures' },
  { name: 'RCC & Slab Casting', slug: 'rcc-slab-casting', category: 'Civil Works', icon: Hammer, desc: 'High-quality reinforced concrete work with precision engineering' },
  { name: 'Brick Work & Plastering', slug: 'brick-work-plastering', category: 'Civil Works', icon: Hammer, desc: 'Professional masonry and smooth plastering services' },
  { name: 'Bathroom Plumbing', slug: 'bathroom-plumbing', category: 'Plumbing', icon: Wrench, desc: 'Complete bathroom plumbing with premium fittings and fixtures' },
  { name: 'Kitchen Plumbing', slug: 'kitchen-plumbing', category: 'Plumbing', icon: Wrench, desc: 'Kitchen plumbing solutions with modern fixtures and drainage' },
  { name: 'Smart Wiring', slug: 'smart-wiring', category: 'Electrical', icon: Zap, desc: 'Complete home wiring with smart automation and safety systems' },
  { name: 'Solar Installation', slug: 'solar-installation', category: 'Electrical', icon: Zap, desc: 'Solar panel setup with net metering for sustainable energy' },
  { name: 'CCTV Installation', slug: 'cctv-installation', category: 'Electrical', icon: Zap, desc: 'HD security camera systems with remote monitoring capability' },
  { name: 'Tile Flooring', slug: 'tile-flooring', category: 'Flooring', icon: Grid3X3, desc: 'Premium tile flooring with expert installation and finishing' },
  { name: 'Granite & Marble', slug: 'granite-marble', category: 'Flooring', icon: Grid3X3, desc: 'Luxury granite and marble flooring for elegant spaces' },
  { name: 'Interior Painting', slug: 'interior-painting', category: 'Painting', icon: Paintbrush, desc: 'Professional interior painting with premium paints and clean finish' },
  { name: 'Exterior Painting', slug: 'exterior-painting', category: 'Painting', icon: Paintbrush, desc: 'Weather-resistant exterior painting for lasting beauty' },
  { name: 'Texture Painting', slug: 'texture-painting', category: 'Painting', icon: Paintbrush, desc: 'Decorative texture painting with unique patterns and finishes' },
  { name: 'Modular Kitchen', slug: 'modular-kitchen', category: 'Interiors', icon: Sofa, desc: 'Custom modular kitchens with premium hardware and finishes' },
  { name: 'Wardrobes', slug: 'wardrobes', category: 'Interiors', icon: Sofa, desc: 'Built-in and walk-in wardrobes with smart storage solutions' },
  { name: 'False Ceiling', slug: 'false-ceiling', category: 'Interiors', icon: Sofa, desc: 'Designer false ceilings with ambient lighting integration' },
  { name: 'Terrace Waterproofing', slug: 'terrace-waterproofing', category: 'Waterproofing', icon: Droplets, desc: 'Complete terrace waterproofing with 10-year warranty' },
  { name: 'Bathroom Waterproofing', slug: 'bathroom-waterproofing', category: 'Waterproofing', icon: Droplets, desc: 'Bathroom waterproofing to prevent seepage and leakage' },
  { name: 'Smart Locks', slug: 'smart-locks', category: 'Smart Home', icon: Shield, desc: 'Digital door locks with fingerprint, PIN, and app access' },
  { name: 'Home Theatre', slug: 'home-theatre', category: 'Smart Home', icon: Shield, desc: 'Custom home theatre setup with premium audio-visual systems' },
  { name: 'EV Charger', slug: 'ev-charger', category: 'Smart Home', icon: Shield, desc: 'Electric vehicle charger installation for your home' },
];

export default function Services() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [cmsServices, setCmsServices] = useState([]);

  useEffect(() => {
    api.get('/api/services')
      .then(res => {
        const normalized = (res.data || [])
          .filter(service => service.active !== false && service.status !== 'inactive')
          .map(service => ({
            ...service,
            isCms: true,
            slug: service.slug || service.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
            icon: Home,
            desc: service.description,
          }));
        setCmsServices(normalized);
      })
      .catch(() => setCmsServices([]));
  }, []);

  const serviceSource = cmsServices.length ? cmsServices : allServices;

  const filtered = activeCategory === 'All'
    ? serviceSource
    : serviceSource.filter(s => s.category === activeCategory);

  return (
    <div className="pt-24">
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            label="Services"
            title="Complete Construction Solutions"
            description="From foundation to smart home — everything you need under one roof"
          />

          {/* Category Filter */}
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

          {/* Services Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service, i) => (
              <GlassCard key={service.name} delay={i * 0.03}>
                <Link to={service.isCms ? '/services' : `/services/${service.slug}`} className="block group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <service.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-blue-400/60 bg-blue-500/5 px-2 py-1 rounded-lg">{service.category}</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2 font-heading group-hover:text-blue-400 transition-colors">{service.name}</h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-4">{service.desc || service.description}</p>
                  {service.approx_price && <p className="mb-4 text-xs font-semibold text-amber-300">{service.approx_price}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/30">Get free quote →</span>
                    <span className="text-xs text-blue-400 font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      Know More <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
