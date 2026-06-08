import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800" />
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 60%)`,
          }} />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-[100px]" />

          <div className="relative px-8 py-16 md:px-16 md:py-20 text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-heading mb-4">
              Ready to Build Your Dream Home?
            </h2>
            <p className="text-blue-100/60 text-base md:text-lg max-w-xl mx-auto mb-10">
              Get a free consultation with our expert team. No obligations, just honest advice and a clear roadmap for your project.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 rounded-2xl px-8 h-14 text-base font-semibold shadow-2xl gap-2 group">
                  Free Consultation
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="tel:+918688074469">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-2xl px-8 h-14 text-base font-semibold gap-2">
                  <Phone className="w-4 h-4" />
                  Call Now
                </Button>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}