import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import api from '@/lib/api';

const reviews = [
  { name: 'Rajesh Kumar', rating: 5, comment: 'MBC built our dream villa in Hyderabad. The quality of work and professionalism exceeded expectations. Highly recommended!', service: 'Villa Construction', location: 'Hyderabad' },
  { name: 'Priya Sharma', rating: 5, comment: 'Amazing interior design work. They transformed our 3BHK into a modern, luxurious living space. Every detail was perfect.', service: 'Interior Design', location: 'Secunderabad' },
  { name: 'Venkat Rao', rating: 5, comment: 'The waterproofing team solved our terrace leakage problem permanently. 2 years and no issues. Great service!', service: 'Waterproofing', location: 'Kukatpally' },
  { name: 'Lakshmi Devi', rating: 5, comment: 'Got our entire home painted. The finish quality is outstanding. Clean work, on-time delivery, and great communication.', service: 'Painting', location: 'Gachibowli' },
  { name: 'Suresh Reddy', rating: 5, comment: 'Complete house construction from scratch. MBC handled everything from design to handover seamlessly. 10/10 experience!', service: 'House Construction', location: 'Miyapur' },
  { name: 'Anitha Rao', rating: 5, comment: 'Modular kitchen installation was flawless. Modern design, premium materials, and installed within the promised timeline.', service: 'Modular Kitchen', location: 'Kondapur' },
];

export default function ReviewsCarousel() {
  const [cmsReviews, setCmsReviews] = useState([]);

  useEffect(() => {
    api.get('/api/reviews')
      .then(res => {
        const normalized = (res.data || [])
          .filter(review => review.active !== false)
          .map(review => ({
            name: review.name || review.customer_name,
            rating: review.rating || 5,
            comment: review.comment || review.review_text,
            service: review.service_category,
            location: review.location,
            photo_url: review.photo_url,
          }));
        setCmsReviews(normalized);
      })
      .catch(() => setCmsReviews([]));
  }, []);

  const reviewSource = cmsReviews.length ? cmsReviews : reviews;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          label="Testimonials"
          title="What Our Clients Say"
          description="Real stories from homeowners who trusted us with their dream projects"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviewSource.map((review, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="glass glass-hover rounded-2xl p-6 relative group"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: review.rating }, (_, j) => (
                  <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-white/60 leading-relaxed mb-6">"{review.comment}"</p>
              <div className="flex items-center gap-3">
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
  );
}
