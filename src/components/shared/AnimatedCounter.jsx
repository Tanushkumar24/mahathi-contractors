import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

export default function AnimatedCounter({ end, suffix = '', prefix = '', duration = 2, label, icon: Icon }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let startTime;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end, duration]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center"
    >
      {Icon && (
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      )}
      <div className="text-3xl md:text-4xl font-bold text-white font-heading">
        {prefix}{count}{suffix}
      </div>
      <p className="text-sm text-white/40 mt-1">{label}</p>
    </motion.div>
  );
}