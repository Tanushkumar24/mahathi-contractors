import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      <motion.a
        href="tel:+918688074469"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-600 to-blue-500 flex items-center justify-center shadow-xl shadow-blue-500/30 relative"
      >
        <Phone className="w-6 h-6 text-white" />
        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20" />
      </motion.a>
      <motion.a
        href="https://wa.me/918688074469"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.2, type: 'spring' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-green-500 flex items-center justify-center shadow-xl shadow-green-500/30 relative"
      >
        <MessageCircle className="w-6 h-6 text-white" />
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
      </motion.a>
    </div>
  );
}