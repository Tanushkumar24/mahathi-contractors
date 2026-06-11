import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, FileText, Check, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const services = [
  'House Construction', 'Commercial Construction', 'Renovation', 'Interior Design',
  'Painting', 'Waterproofing', 'Electrical Works', 'Plumbing',
  'Flooring', 'Modular Kitchen', 'False Ceiling', 'Maintenance',
];

const timeSlots = {
  Morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['1:00 PM', '2:00 PM', '3:00 PM'],
  Evening: ['5:00 PM', '6:00 PM', '7:00 PM'],
};

const steps = [
  { label: 'Service', icon: FileText },
  { label: 'Schedule', icon: Calendar },
  { label: 'Details', icon: MapPin },
  { label: 'Confirm', icon: Check },
];

const cleanMobile = (value) => value.replace(/\D/g, '').slice(0, 10);

export default function Book() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    service_name: '',
    date: '',
    time_slot: '',
    contact_name: '',
    contact_phone: '',
    address: '',
    notes: '',
    send_whatsapp_updates: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setBooking((prev) => ({
        ...prev,
        contact_name: prev.contact_name || user.name || '',
        contact_phone: prev.contact_phone || cleanMobile(user.mobile_number || ''),
      }));
    }
  }, [user]);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const canProceed = () => {
    if (step === 0) return booking.service_name;
    if (step === 1) return booking.date && booking.time_slot;
    if (step === 2) return booking.contact_name && booking.contact_phone.length === 10 && booking.address;
    return true;
  };

  const handleSubmit = async () => {
    if (booking.contact_phone.length !== 10) {
      toast.error('Please enter exactly 10 digits for mobile number.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/api/bookings', {
        ...booking,
        contact_phone: `+91${booking.contact_phone}`,
        created_by_id: user?.id || null,
      });
      toast.success('Booking received. Our team will contact you shortly.');
      setStep(4);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <section className="relative py-16">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-blue-400">Book a site visit</p>
            <h1 className="font-heading text-3xl font-bold text-white md:text-5xl">Tell us what you want built</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/50">
              Guests can book without login. Our team will review your requirement and contact you with the next steps.
            </p>
          </div>

          <div className="mb-10 flex items-center justify-center gap-2 overflow-x-auto">
            {steps.map((item, index) => (
              <React.Fragment key={item.label}>
                <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition ${
                  index <= step ? 'border-blue-500/30 bg-blue-500/15 text-blue-300' : 'border-white/5 text-white/30'
                }`}>
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </div>
                {index < steps.length - 1 && <ChevronRight className="h-4 w-4 text-white/10" />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="service" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="font-heading text-2xl font-bold text-white">Select a service</h2>
                <p className="mb-6 mt-2 text-sm text-white/45">Choose the work category that best matches your requirement.</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((service) => (
                    <button
                      key={service}
                      onClick={() => setBooking({ ...booking, service_name: service })}
                      className={`rounded-xl border p-4 text-left text-sm font-semibold transition ${
                        booking.service_name === service
                          ? 'border-blue-500/40 bg-blue-500/20 text-blue-300'
                          : 'border-white/5 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white'
                      }`}
                    >
                      {service}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="schedule" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="font-heading text-2xl font-bold text-white">Pick date and time</h2>
                <p className="mb-6 mt-2 text-sm text-white/45">Select a convenient slot for our team to contact or visit you.</p>
                <label className="mb-3 block text-xs uppercase tracking-wider text-white/40">Date</label>
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setBooking({ ...booking, date: dateStr })}
                        className={`flex shrink-0 flex-col items-center rounded-xl border px-4 py-3 text-xs transition ${
                          booking.date === dateStr ? 'border-blue-500/40 bg-blue-500/20 text-blue-300' : 'border-white/5 bg-white/[0.03] text-white/50'
                        }`}
                      >
                        <span className="uppercase">{format(date, 'EEE')}</span>
                        <span className="mt-1 text-lg font-bold">{format(date, 'd')}</span>
                        <span>{format(date, 'MMM')}</span>
                      </button>
                    );
                  })}
                </div>

                <label className="mb-3 block text-xs uppercase tracking-wider text-white/40">Time</label>
                <div className="space-y-4">
                  {Object.entries(timeSlots).map(([period, slots]) => (
                    <div key={period}>
                      <p className="mb-2 text-xs text-white/35">{period}</p>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setBooking({ ...booking, time_slot: slot })}
                            className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                              booking.time_slot === slot ? 'border-blue-500/40 bg-blue-500/20 text-blue-300' : 'border-white/5 bg-white/[0.03] text-white/50'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="details" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="font-heading text-2xl font-bold text-white">Your details</h2>
                <p className="mb-6 mt-2 text-sm text-white/45">No verification code required. We use these details only to coordinate your booking.</p>
                <div className="space-y-4">
                  <Input placeholder="Full Name *" value={booking.contact_name} onChange={(e) => setBooking({ ...booking, contact_name: e.target.value })} className="h-12 rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30" />
                  <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                    <span className="flex items-center border-r border-white/10 px-3 text-sm font-semibold text-white/50">+91</span>
                    <Input
                      placeholder="10 digit mobile number *"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={booking.contact_phone}
                      onChange={(e) => setBooking({ ...booking, contact_phone: cleanMobile(e.target.value) })}
                      className="h-full rounded-none border-0 bg-transparent text-white placeholder:text-white/30 focus-visible:ring-0"
                    />
                  </div>
                  <Textarea placeholder="Address / City *" value={booking.address} onChange={(e) => setBooking({ ...booking, address: e.target.value })} className="min-h-[90px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30" />
                  <Textarea placeholder="Notes (optional)" value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} className="min-h-[90px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30" />
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={booking.send_whatsapp_updates}
                      onChange={(e) => setBooking({ ...booking, send_whatsapp_updates: e.target.checked })}
                      className="mt-1 h-4 w-4"
                    />
                    <span>Send booking updates on WhatsApp</span>
                  </label>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="font-heading text-2xl font-bold text-white">Confirm booking</h2>
                <p className="mb-6 mt-2 text-sm text-white/45">Review your request before submitting.</p>
                <div className="space-y-4">
                  {[
                    ['Service', booking.service_name],
                    ['Date', booking.date ? format(new Date(booking.date), 'EEEE, MMMM d, yyyy') : ''],
                    ['Time', booking.time_slot],
                    ['Name', booking.contact_name],
                    ['Mobile', booking.contact_phone ? `+91${booking.contact_phone}` : ''],
                    ['Address / City', booking.address],
                    ['WhatsApp Updates', booking.send_whatsapp_updates ? 'Yes' : 'No'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-start justify-between border-b border-white/5 py-3 last:border-0">
                      <span className="text-sm text-white/40">{label}</span>
                      <span className="max-w-[62%] text-right text-sm font-semibold text-white">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 text-center md:p-12">
                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-10 w-10 text-green-400" />
                </div>
                <h2 className="font-heading text-2xl font-bold text-white">Booking received</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/50">
                  Our team will contact you shortly to discuss your {booking.service_name} requirement.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {step < 4 && (
            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={step === 0} className="gap-2 rounded-xl border-white/10 text-white/60 hover:bg-white/5 hover:text-white">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep(step + 1)} disabled={!canProceed()} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 font-semibold text-white">
                  Continue <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={submitting} className="gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 font-semibold text-white">
                  {submitting ? 'Submitting...' : 'Confirm Booking'} <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
