import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Clock, Send, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { toast } from 'sonner';
import SectionHeader from '../components/shared/SectionHeader';
import GlassCard from '../components/shared/GlassCard';

const contactInfo = [
  { icon: Phone, label: 'Phone', value: '+91 86880 74469', href: 'tel:+918688074469' },
  { icon: MessageCircle, label: 'WhatsApp', value: '+91 86880 74469', href: 'https://wa.me/918688074469' },
  { icon: Mail, label: 'Email', value: 'mahathicontractors@gmail.com', href: 'mailto:mahathicontractors@gmail.com' },
  { icon: MapPin, label: 'Location', value: 'Vijayawada, AP, India', href: null },
  { icon: Clock, label: 'Working Hours', value: 'Mon - Sat: 9AM - 8PM', href: null },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', service_needed: '', message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/api/leads', formData);
      toast.success('Message sent! We\'ll get back to you shortly.');
      setFormData({ name: '', phone: '', email: '', service_needed: '', message: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to send message. Please try again.');
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
            label="Contact Us"
            title="Let's Build Together"
            description="Get in touch for a free consultation or any questions about our services"
          />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              {contactInfo.map((info, i) => (
                <GlassCard key={i} delay={i * 0.05} hover={false}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                      <info.icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-0.5">{info.label}</p>
                      {info.href ? (
                        <a href={info.href} target={info.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="text-sm text-white hover:text-blue-400 transition-colors font-medium">
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-sm text-white font-medium">{info.value}</p>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))}

              <GlassCard hover={false}>
                <p className="text-xs uppercase tracking-[0.22em] text-amber-300">Company Profile</p>
                <h3 className="mt-3 font-heading text-xl font-bold text-white">Simhadri Sampath Kumar</h3>
                <p className="mt-1 text-sm font-semibold text-blue-300">Founder & Sole Proprietor</p>
                <p className="mt-3 text-sm leading-6 text-white/45">
                  20+ years of practical construction experience across civil works, residential projects, renovations, interiors, and reliable site execution.
                </p>
              </GlassCard>

              {/* Quick Actions */}
              <div className="pt-4 space-y-3">
                <a href="https://wa.me/918688074469" target="_blank" rel="noopener noreferrer" className="block">
                  <Button className="w-full bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/20 rounded-xl h-12 font-semibold gap-2">
                    <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                  </Button>
                </a>
                <a href="tel:+918688074469" className="block">
                  <Button className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-xl h-12 font-semibold gap-2">
                    <Phone className="w-4 h-4" /> Call Now
                  </Button>
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass rounded-2xl p-6 md:p-8"
              >
                <h3 className="text-xl font-bold text-white font-heading mb-6">Send us a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      placeholder="Your Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                    <Input
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                    />
                  </div>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                  />
                  <Select value={formData.service_needed} onValueChange={(v) => setFormData({ ...formData, service_needed: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl">
                      <SelectValue placeholder="Select Service Needed" />
                    </SelectTrigger>
                    <SelectContent>
                      {['House Construction', 'Interior Design', 'Painting', 'Waterproofing', 'Electrical', 'Plumbing', 'Flooring', 'Smart Home', 'Other'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Tell us about your project..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl min-h-[120px]"
                  />
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl h-12 font-semibold shadow-lg shadow-blue-500/25 gap-2"
                  >
                    {submitting ? 'Sending...' : 'Send Message'}
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
