import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SectionHeader from '../components/shared/SectionHeader';
import AnimatedCounter from '../components/shared/AnimatedCounter';
import { Users, Award, Heart } from 'lucide-react';

const reviews = [
  { name: 'Rajesh Kumar', rating: 5, comment: 'MBC built our dream villa in Hyderabad. The quality of work and professionalism exceeded expectations. From foundation to finishing, everything was top-notch. Highly recommended for anyone looking for premium construction!', service: 'Villa Construction', location: 'Jubilee Hills' },
  { name: 'Priya Sharma', rating: 5, comment: 'Amazing interior design work. They transformed our 3BHK into a modern, luxurious living space. The modular kitchen and wardrobes are stunning. Every detail was meticulously planned and executed.', service: 'Interior Design', location: 'Gachibowli' },
  { name: 'Venkat Rao', rating: 5, comment: 'The waterproofing team solved our terrace leakage problem permanently. Its been 2 years and absolutely no issues. Great service with warranty support!', service: 'Waterproofing', location: 'Kukatpally' },
  { name: 'Lakshmi Devi', rating: 5, comment: 'Got our entire home painted by MBC. The finish quality is outstanding — smooth, even, and premium paints were used. Clean work, on-time delivery, and great communication throughout.', service: 'Painting', location: 'Kondapur' },
  { name: 'Suresh Reddy', rating: 5, comment: 'Complete house construction from scratch. MBC handled everything from architectural design to handover. The project was delivered on time and within budget. Truly a 10/10 experience!', service: 'House Construction', location: 'Miyapur' },
  { name: 'Anitha Rao', rating: 5, comment: 'Modular kitchen installation was flawless. Modern design with soft-close drawers, premium hardware, and installed within the promised timeline. Love how it turned out!', service: 'Modular Kitchen', location: 'Banjara Hills' },
  { name: 'Mohammed Ismail', rating: 5, comment: 'Smart home installation including CCTV, smart locks, and automated lighting. The team was knowledgeable and the setup works perfectly. Very futuristic feel!', service: 'Smart Home', location: 'HITEC City' },
  { name: 'Kavitha Reddy', rating: 5, comment: 'False ceiling with beautiful ambient lighting design. The living room looks like a 5-star hotel lobby now. Excellent craftsmanship and creative design team.', service: 'False Ceiling', location: 'Secunderabad' },
  { name: 'Ravi Teja', rating: 5, comment: 'Got flooring done for our entire house — Italian marble in the living room and vitrified tiles in bedrooms. The result is stunning. Professional team and great material quality.', service: 'Flooring', location: 'Manikonda' },
];

export default function Reviews() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            label="Client Reviews"
            title="Trusted by 100+ Happy Clients"
            description="Real feedback from homeowners who chose MBC for their dream projects"
          />

          {/* Overall Rating */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-8 max-w-md mx-auto text-center mb-16"
          >
            <div className="text-5xl font-bold text-white font-heading mb-2">4.9</div>
            <div className="flex items-center justify-center gap-1 mb-3">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <p className="text-sm text-white/40">Based on 100+ reviews</p>
          </motion.div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mb-16">
            <AnimatedCounter end={100} suffix="+" label="Happy Clients" icon={Users} />
            <AnimatedCounter end={98} suffix="%" label="Satisfaction" icon={Heart} />
            <AnimatedCounter end={95} suffix="%" label="Repeat Clients" icon={Award} />
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="glass glass-hover rounded-2xl p-6 relative group"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating }, (_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">"{review.comment}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{review.name}</p>
                    <p className="text-xs text-white/40">{review.service} · {review.location}</p>
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