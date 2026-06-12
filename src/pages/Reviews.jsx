import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Quote, Send, Star } from 'lucide-react';
import { toast } from 'sonner';
import SectionHeader from '../components/shared/SectionHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';

const initialForm = {
  name: '',
  rating: 5,
  review_text: '',
  service_category: '',
  photo: null,
};

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    api.get('/api/reviews')
      .then(res => setReviews(res.data || []))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);

  const submitReview = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const payload = new FormData();
      payload.append('name', form.name);
      payload.append('rating', String(form.rating));
      payload.append('review_text', form.review_text);
      payload.append('service_category', form.service_category);
      if (form.photo) payload.append('photo', form.photo);

      await api.post('/api/reviews', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Review submitted. It will appear after admin approval.');
      setForm(initialForm);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24">
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <SectionHeader
            label="Client Reviews"
            title="Customer Experiences"
            description="Approved reviews from customers who worked with Mahathi Building Contractors"
          />

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(item => <div key={item} className="glass h-64 rounded-2xl animate-pulse" />)}
            </div>
          ) : reviews.length === 0 ? (
            <div className="glass mx-auto max-w-xl rounded-2xl p-12 text-center">
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
                  transition={{ duration: 0.5, delay: index * 0.06 }}
                  className="glass glass-hover rounded-2xl p-6 relative group"
                >
                  <Quote className="absolute top-4 right-4 w-8 h-8 text-blue-500/10 group-hover:text-blue-500/20 transition-colors" />
                  <div className="flex items-center gap-1 mb-4">
                    {Array.from({ length: review.rating || 5 }, (_, item) => (
                      <Star key={item} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-white/60 leading-relaxed mb-6">"{review.review_text || review.comment}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-white/5">
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

          <div className="glass mx-auto mt-16 max-w-2xl rounded-2xl p-6 md:p-8">
            <h2 className="font-heading text-2xl font-bold text-white">Share your experience</h2>
            <p className="mt-2 text-sm text-white/45">Your review will be visible after admin approval.</p>
            <form onSubmit={submitReview} className="mt-6 space-y-4">
              <Input placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="bg-white/5 border-white/10 text-white" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input type="number" min="1" max="5" placeholder="Rating 1-5 *" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} required className="bg-white/5 border-white/10 text-white" />
                <Input placeholder="Service / project reference" value={form.service_category} onChange={e => setForm({ ...form, service_category: e.target.value })} className="bg-white/5 border-white/10 text-white" />
              </div>
              <Textarea placeholder="Review message *" value={form.review_text} onChange={e => setForm({ ...form, review_text: e.target.value })} required className="min-h-[120px] bg-white/5 border-white/10 text-white" />
              <label className="block rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
                Optional photo
                <input type="file" accept="image/*" onChange={e => setForm({ ...form, photo: e.target.files?.[0] || null })} className="mt-2 block w-full text-xs text-white/45" />
              </label>
              <Button type="submit" disabled={submitting} className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                <Send className="mr-2 h-4 w-4" /> {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
