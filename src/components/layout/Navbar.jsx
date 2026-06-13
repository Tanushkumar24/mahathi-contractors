import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { LayoutDashboard, LogOut, Menu, ShieldCheck, UserCircle, X } from 'lucide-react';
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
  const [menuOpen, setMenuOpen] = React.useState(false);
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Build navigation links dynamically
  const navLinks = [...baseLinks];
  if (isAuthenticated) {
    navLinks.push({ label: 'Dashboard', path: '/dashboard' });
    navLinks.push({ label: 'Profile', path: '/profile' });
    if (isAdmin) {
      navLinks.push({ label: 'Admin', path: '/admin' });
    }
  }

  const mobileDirectLinks = baseLinks.filter((link) =>
    ['/', '/about', '/services', '/projects'].includes(link.path)
  );
  const mobileMenuLinks = baseLinks.filter((link) =>
    ['/reviews', '/contact'].includes(link.path)
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
          <Link to="/" className="flex shrink-0 items-center gap-2">
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
          <div className="flex lg:hidden items-center gap-1.5">
            <Link to="/book" className="rounded-lg bg-blue-600 px-3 py-2 text-[11px] font-semibold text-white shadow-lg shadow-blue-500/20">
              Book
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  aria-label="Dashboard"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-white transition ${
                    location.pathname === '/dashboard' ? 'border-blue-400/40 bg-blue-500/15' : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className={`rounded-lg px-2.5 py-2 text-[11px] font-semibold transition ${
                      location.pathname === '/admin'
                        ? 'bg-amber-500/20 text-amber-200'
                        : 'border border-amber-400/25 bg-amber-400/10 text-amber-200'
                    }`}
                  >
                    Admin
                  </Link>
                )}
                <Link
                  to="/profile"
                  aria-label="Profile"
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border text-white transition ${
                    location.pathname === '/profile' ? 'border-blue-400/40 bg-blue-500/15' : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  <UserCircle className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <Link to="/login" className="rounded-lg border border-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/70">
                Login
              </Link>
            )}
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-white"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="grid grid-cols-4 gap-1 pb-2 lg:hidden">
          {mobileDirectLinks.map((link) => (
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

        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="grid grid-cols-2 gap-2 pb-3 lg:hidden"
            >
              {mobileMenuLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`rounded-xl px-3 py-3 text-center text-xs font-semibold transition-all ${
                    location.pathname === link.path
                      ? 'bg-blue-500/15 text-blue-300'
                      : 'bg-white/[0.05] text-white/70 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={logout}
                  className="col-span-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-3 text-xs font-semibold text-red-200"
                >
                  <LogOut className="mr-2 inline h-3.5 w-3.5" />
                  Logout
                </button>
              )}
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
      {isAdmin && (
        <Link
          to="/admin"
          className="fixed bottom-24 right-4 z-[60] flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 shadow-xl shadow-amber-500/20 lg:hidden"
        >
          <ShieldCheck className="h-4 w-4" />
          Admin Panel
        </Link>
      )}
    </motion.header>
  );
}
