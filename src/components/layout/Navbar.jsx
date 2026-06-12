import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

const baseLinks = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Services', path: '/services' },
  { label: 'Projects', path: '/projects' },
  { label: 'Reviews', path: '/reviews' },
  { label: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = React.useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Build navigation links dynamically
  const navLinks = [...baseLinks];
  if (isAuthenticated) {
    navLinks.push({ label: 'Dashboard', path: '/dashboard' });
    if (user?.role === 'admin') {
      navLinks.push({ label: 'Admin', path: '/admin' });
    }
  }

  const mobileMainLinks = navLinks.filter((link) =>
    ['/', '/about', '/services', '/projects'].includes(link.path)
  );

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass border-b border-white/5 shadow-lg shadow-black/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div>
              <span className="text-lg font-bold text-white font-heading tracking-tight">MBC</span>
              <span className="hidden sm:block text-[10px] text-blue-400/70 -mt-1 tracking-widest uppercase">Mahathi Building Contractors</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  location.pathname === link.path
                    ? 'text-blue-400 bg-blue-500/10'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <Button 
                onClick={logout} 
                variant="outline" 
                className="border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-xl gap-2 text-xs h-10 px-4"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            ) : (
              <Link to="/login">
                <Button className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/20 rounded-xl px-5 h-10 text-xs font-semibold">
                  Login
                </Button>
              </Link>
            )}

            <Link to="/book">
              <Button className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl px-6 h-10 text-xs font-semibold shadow-lg shadow-blue-500/25">
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated ? (
              <button onClick={logout} className="rounded-lg border border-red-500/20 px-3 py-1.5 text-[11px] font-semibold text-red-300">
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70">
                Login
              </Link>
            )}
            <Link to="/book" className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-lg shadow-blue-500/20">
              Book
            </Link>
          </div>
        </div>

        {/* Mobile Direct Nav */}
        <nav className="grid grid-cols-4 gap-1 pb-2 lg:hidden">
          {mobileMainLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`rounded-lg px-1.5 py-2 text-center text-[11px] font-semibold transition-all ${
                location.pathname === link.path
                  ? 'bg-blue-500/15 text-blue-300'
                  : 'bg-white/[0.04] text-white/65 hover:bg-white/[0.08] hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </motion.header>
  );
}
