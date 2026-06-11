import React from 'react';
import { Calendar, Users, Wrench, Star } from 'lucide-react';
import AnimatedCounter from '../shared/AnimatedCounter';

const stats = [
  { end: 5, suffix: '+', label: 'Years Experience', icon: Calendar },
  { end: 100, suffix: '+', label: 'Happy Customers', icon: Users },
  { end: 50, suffix: '+', label: 'Professional Workers', icon: Wrench },
  { end: 49, suffix: '', prefix: '', label: '4.9 Star Rating', icon: Star },
];

export default function StatsSection() {
  return (
    <section className="relative py-20 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/30 via-transparent to-blue-950/30" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <AnimatedCounter
              key={i}
              end={stat.end}
              suffix={stat.suffix}
              prefix={stat.prefix}
              label={stat.label}
              icon={stat.icon}
              duration={2}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
