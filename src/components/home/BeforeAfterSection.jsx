import React, { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';

const projects = [
  {
    title: 'Living Room Renovation',
    category: 'Interior Design',
    before: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
  },
  {
    title: 'Exterior Painting',
    category: 'Painting',
    before: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
  },
  {
    title: 'Kitchen Transformation',
    category: 'Modular Kitchen',
    before: 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=600&q=80',
    after: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=80',
  },
];

function Slider({ before, after }) {
  const [pos, setPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const move = useCallback((clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setPos(pct);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-56 md:h-72 rounded-2xl overflow-hidden cursor-col-resize select-none"
      onMouseMove={(e) => dragging.current && move(e.clientX)}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchMove={(e) => move(e.touches[0].clientX)}
    >
      {/* After (base) */}
      <img src={after} alt="After" className="absolute inset-0 w-full h-full object-cover" />
      <span className="absolute bottom-3 right-3 text-xs font-semibold text-white bg-green-500/80 px-2 py-0.5 rounded-full z-10">After</span>

      {/* Before (clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img src={before} alt="Before" className="absolute inset-0 w-full h-full object-cover" style={{ width: `${10000 / pos}%`, maxWidth: 'none' }} />
        <span className="absolute bottom-3 left-3 text-xs font-semibold text-white bg-red-500/80 px-2 py-0.5 rounded-full">Before</span>
      </div>

      {/* Divider */}
      <div className="absolute top-0 bottom-0 z-20" style={{ left: `${pos}%` }}>
        <div className="absolute inset-y-0 w-0.5 bg-white/80 -translate-x-1/2" />
        <div
          className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center cursor-col-resize"
          onMouseDown={() => { dragging.current = true; }}
          onTouchStart={() => { dragging.current = true; }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M8 5l-5 7 5 7M16 5l5 7-5 7" stroke="#0A0E1A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function BeforeAfterSection() {
  return (
    <section className="py-24 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/4 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          label="Transformations"
          title="Before & After"
          description="Drag the slider to see stunning project transformations"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {projects.map((proj, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-4"
            >
              <Slider before={proj.before} after={proj.after} />
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-white font-heading">{proj.title}</h3>
                <p className="text-xs text-blue-400 mt-0.5">{proj.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}