import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';
import api from '@/lib/api';

const categories = ['All', 'Residential', 'Commercial', 'Interior', 'Villa', 'Renovation'];

const normalizeArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
};

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/projects')
      .then(res => {
        const normalized = (res.data || []).map(project => {
          const imageUrls = normalizeArray(project.image_urls || project.media_urls);
          return {
            ...project,
            image: project.image_url || imageUrls[0] || '',
            image_urls: imageUrls,
            video_urls: normalizeArray(project.video_urls),
          };
        });
        setProjects(normalized);
      })
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(project => project.category === activeCategory);

  return (
    <div className="pt-24">
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            label="Portfolio"
            title="Our Projects"
            description="Completed and ongoing work managed directly by Mahathi Building Contractors"
          />

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

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(item => <div key={item} className="glass h-80 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass mx-auto max-w-xl rounded-2xl p-12 text-center">
              <p className="text-sm text-white/45">No projects available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((project, index) => (
                <motion.div
                  key={project.id || project.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  whileHover={{ y: -5 }}
                  className="glass rounded-2xl overflow-hidden group"
                >
                  <div className="relative h-56 overflow-hidden">
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white/5 text-sm text-white/30">
                        Project media coming soon
                      </div>
                    )}
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
                    {project.location && (
                      <div className="flex items-center gap-1 text-xs text-white/40 mb-3">
                        <MapPin className="w-3 h-3" /> {project.location}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-blue-400 font-medium">{project.category}</span>
                      <span className="text-white/30">{project.video_urls.length ? `${project.video_urls.length} videos` : ''}</span>
                    </div>
                    {project.description && <p className="mt-3 line-clamp-2 text-sm text-white/45">{project.description}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
