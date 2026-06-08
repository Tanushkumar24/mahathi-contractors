import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, ArrowUpRight } from 'lucide-react';

const footerLinks = {
  Services: [
    { label: 'House Construction', path: '/services' },
    { label: 'Interior Design', path: '/services' },
    { label: 'Waterproofing', path: '/services' },
    { label: 'Painting', path: '/services' },
    { label: 'Smart Home', path: '/services' },
  ],
  Company: [
    { label: 'About Us', path: '/about' },
    { label: 'Projects', path: '/projects' },
    { label: 'Reviews', path: '/reviews' },

    { label: 'Contact', path: '/contact' },
  ],
  Support: [
    { label: 'Book a Service', path: '/book' },
    { label: 'Free Consultation', path: '/contact' },
    { label: 'Request Callback', path: '/contact' },
    { label: 'FAQs', path: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-t from-blue-950/20 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <span className="text-xl font-bold text-white font-heading">MBC</span>
                <p className="text-[10px] text-blue-400/70 tracking-widest uppercase">Mahathi Building Contractors</p>
              </div>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-sm mb-6">
              Under Construction Today. Your Dream Home Tomorrow. Building premium homes and commercial spaces for over 20 years.
            </p>
            <div className="space-y-2">
              <a href="tel:+918688074469" className="flex items-center gap-2 text-sm text-white/50 hover:text-blue-400 transition-colors">
                <Phone className="w-4 h-4" /> +91 86880 74469
              </a>
              <a href="mailto:mahathicontractors@gmail.com" className="flex items-center gap-2 text-sm text-white/50 hover:text-blue-400 transition-colors">
                <Mail className="w-4 h-4" /> mahathicontractors@gmail.com
              </a>
              <div className="flex items-start gap-2 text-sm text-white/50">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" /> Hyderabad, India
              </div>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4 tracking-wide">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-sm text-white/40 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      {link.label}
                      <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Mahathi Building Contractors — Sole Proprietor: Simhadri Sampath Kumar. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}