import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import api from '@/lib/api';
import SectionHeader from '../shared/SectionHeader';

export default function ReviewsCarousel() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reviews')
      .then(res => setReviews(res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <SectionHeader
          label="Testimonials"
          title="What Our Clients Say"
          description="Approved customer reviews from Mahathi Building Contractors projects"
        />

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(item => <div key={item} className="glass h-64 rounded-2xl animate-pulse" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="glass mx-auto max-w-xl rounded-2xl p-10 text-center">
            <p className="text-sm text-white/45">No reviews yet. Be the first to share your experience.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="glass glass-hover rounded-2xl p-6 relative group"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: review.rating || 5 }, (_, item) => (
                    <Star key={item} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-white/60 leading-relaxed mb-6">"{review.review_text || review.comment}"</p>
                <div className="flex items-center gap-3">
                  {review.photo_url ? (
                    <img src={review.photo_url} alt={review.customer_name || review.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold">
                      {(review.customer_name || review.name || 'M').charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-white">{review.customer_name || review.name}</p>
                    <p className="text-xs text-white/40">{review.service_category || 'Mahathi Contractors'}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
