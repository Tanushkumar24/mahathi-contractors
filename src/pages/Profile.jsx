import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, LayoutDashboard, Mail, Phone, ShieldCheck, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';

const adminEmails = [
  'mahathicontractors@gmail.com',
  'devigayatri2002@gmail.com',
  'tanushkumar2006@gmail.com',
  'simhadri.tanushkumar@gmail.com',
];

export default function Profile() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin' || adminEmails.includes((user?.email || '').toLowerCase());
  const displayName = user?.name || user?.full_name || user?.email?.split('@')[0] || 'Customer';
  const mobile = user?.mobile_number || user?.mobileNumber || 'Not added';

  return (
    <div className="min-h-screen pt-24">
      <section className="py-10 sm:py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-300">Account</p>
            <h1 className="mt-2 font-heading text-3xl font-bold text-white sm:text-4xl">Profile</h1>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Manage your Mahathi Contractors account access and quick actions.
            </p>
          </motion.div>

          <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass rounded-2xl p-6"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/15">
                  <UserCircle className="h-9 w-9 text-blue-300" />
                </div>
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-xl font-bold text-white">{displayName}</h2>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                    {isAdmin ? 'Administrator' : 'Customer'}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/35">
                    <Mail className="h-3.5 w-3.5" />
                    Email
                  </div>
                  <p className="mt-2 break-words text-sm font-medium text-white">{user?.email || 'Not available'}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/35">
                    <Phone className="h-3.5 w-3.5" />
                    Mobile
                  </div>
                  <p className="mt-2 text-sm font-medium text-white">{mobile}</p>
                </div>
                {isAdmin && (
                  <div className="rounded-xl border border-amber-300/20 bg-amber-400/10 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-amber-200">
                      <ShieldCheck className="h-4 w-4" />
                      Admin access enabled
                    </div>
                    <p className="mt-2 text-xs leading-5 text-amber-100/60">
                      You can manage bookings, projects, services, reviews, users, and enquiries.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6"
            >
              <h2 className="font-heading text-xl font-bold text-white">Quick actions</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Access the important pages directly from here.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link to="/dashboard">
                  <Button className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/book">
                  <Button variant="outline" className="h-12 w-full rounded-xl border-white/10 text-white hover:bg-white/5">
                    <CalendarPlus className="mr-2 h-4 w-4" />
                    Book Service
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="sm:col-span-2">
                    <Button className="h-12 w-full rounded-xl bg-amber-400 text-slate-950 hover:bg-amber-300">
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Button>
                  </Link>
                )}
              </div>

              <button
                type="button"
                onClick={logout}
                className="mt-6 w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-500/15"
              >
                Logout
              </button>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
