import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Image as ImageIcon, Video } from 'lucide-react';
import api from '@/lib/api';
import SectionHeader from '../components/shared/SectionHeader';

export default function Gallery() {
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/media')
      .then(res => setMedia(res.data || []))
      .catch(() => setMedia([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-24">
      <section className="relative py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            label="Media Gallery"
            title="Photos & Videos"
            description="Recent construction, renovation, interiors, and maintenance work from Mahathi Building Contractors"
          />

          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map(item => <div key={item} className="glass h-64 animate-pulse rounded-2xl" />)}
            </div>
          ) : media.length === 0 ? (
            <div className="glass mx-auto max-w-xl rounded-2xl p-12 text-center">
              <ImageIcon className="mx-auto mb-4 h-10 w-10 text-white/25" />
              <p className="text-sm text-white/45">Gallery media will appear here after admin uploads photos or videos.</p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item, index) => (
                <motion.div
                  key={item.id || item.public_id || item.url}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.04 }}
                  className="glass group overflow-hidden rounded-2xl"
                >
                  <div className="h-64 overflow-hidden bg-white/5">
                    {item.resource_type === 'video' ? (
                      <video src={item.url || item.secure_url} controls className="h-full w-full object-cover" />
                    ) : (
                      <img src={item.url || item.secure_url} alt={item.title || 'Mahathi Contractors work'} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 p-4">
                    {item.resource_type === 'video' ? <Video className="h-4 w-4 text-blue-400" /> : <ImageIcon className="h-4 w-4 text-amber-300" />}
                    <p className="truncate text-sm font-semibold text-white">{item.title || 'Mahathi Contractors media'}</p>
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
