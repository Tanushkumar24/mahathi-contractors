import React from 'react';
import { motion } from 'framer-motion';

export default function GlassCard({ children, className = '', hover = true, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, scale: 1.01 } : {}}
      className={`glass glass-hover rounded-2xl p-6 transition-all duration-500 ${className}`}
    >
      {children}
    </motion.div>
  );
}