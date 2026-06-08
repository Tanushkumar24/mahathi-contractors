import React from 'react';
import { motion } from 'framer-motion';

export default function SectionHeader({ label, title, description, align = 'center' }) {
  const alignClass = align === 'center' ? 'text-center' : 'text-left';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-12 ${alignClass}`}
    >
      {label && (
        <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-3 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
          {label}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mt-2 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-white/40 mt-4 max-w-2xl mx-auto text-base md:text-lg leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}