import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, CheckCircle2, Circle, ArrowUpCircle, X, FileText, Phone, MessageCircle } from 'lucide-react';

import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
const statusConfig = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Circle },
  confirmed: { label: 'Confirmed', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: ArrowUpCircle },
  in_progress: { label: 'In Progress', color: 'text-purple-400', bg: 'bg-purple-500/10', icon: ArrowUpCircle },
  completed: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
  cancelled: { label: 'Cancelled', color: 'text-red-400', bg: 'bg-red-500/10', icon: X },
};

export default function Dashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/bookings');
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      load();
    }
  }, [user]);

  return (
    <div className="pt-24 min-h-screen">
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-white/40 mt-1 text-sm">Track your service bookings</p>
          </motion.div>

          {/* Bookings */}
          <div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="glass rounded-2xl p-6 animate-pulse">
                      <div className="h-4 bg-white/5 rounded w-1/3 mb-3" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : bookings.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center">
                  <div className="text-5xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold text-white mb-2">No Bookings Yet</h3>
                  <p className="text-white/40 text-sm mb-6">Book a service and track everything here.</p>
                  <a href="/book" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl text-sm font-medium hover:bg-blue-600/30 transition-colors">
                    Book a Service
                  </a>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((b, i) => {
                    const cfg = statusConfig[b.status] || statusConfig.pending;
                    const StatusIcon = cfg.icon;
                    return (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass rounded-2xl p-5 md:p-6"
                      >
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="text-base font-semibold text-white font-heading">{b.service_name}</h3>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}>
                                <StatusIcon className="w-3 h-3" /> {cfg.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-white/40">
                              {b.date && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(b.date), 'dd MMM yyyy')}
                                </span>
                              )}
                              {b.time_slot && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {b.time_slot}
                                </span>
                              )}
                              {b.address && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                  <MapPin className="w-3 h-3 shrink-0" /> {b.address}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <a href="https://wa.me/918688074469" target="_blank" rel="noopener noreferrer"
                              className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors">
                              <MessageCircle className="w-4 h-4 text-green-400" />
                            </a>
                            <a href="tel:+918688074469"
                              className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors">
                              <Phone className="w-4 h-4 text-blue-400" />
                            </a>
                          </div>
                        </div>
                        {b.notes && (
                          <p className="text-xs text-white/30 mt-3 pt-3 border-t border-white/5 flex items-start gap-1">
                            <FileText className="w-3 h-3 shrink-0 mt-0.5" /> {b.notes}
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
        </div>
      </section>
    </div>
  );
}