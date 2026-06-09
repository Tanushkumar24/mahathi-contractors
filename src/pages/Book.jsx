import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Camera, FileText, Check, ArrowRight, ArrowLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const services = [
  'House Construction', 'Interior Design', 'Painting', 'Waterproofing',
  'Electrical Works', 'Plumbing', 'Flooring', 'Modular Kitchen',
  'False Ceiling', 'Smart Home', 'Villa Construction', 'Renovation',
];

const timeSlots = {
  Morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['1:00 PM', '2:00 PM', '3:00 PM'],
  Evening: ['5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'],
};

const steps = [
  { label: 'Service', icon: FileText },
  { label: 'Schedule', icon: Calendar },
  { label: 'Details', icon: MapPin },
  { label: 'Confirm', icon: Check },
];

export default function Book() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [booking, setBooking] = useState({
    service_name: '', date: '', time_slot: '',
    contact_name: '', contact_phone: '', address: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setBooking(prev => ({
        ...prev,
        contact_name: prev.contact_name || user.name || '',
        contact_phone: prev.contact_phone || user.mobile_number || '',
      }));
    }
  }, [user]);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + 1));

  const canProceed = () => {
    if (step === 0) return booking.service_name;
    if (step === 1) return booking.date && booking.time_slot;
    if (step === 2) return booking.contact_name && booking.contact_phone && booking.address;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await api.post('/api/bookings', {
        ...booking,
        created_by_id: user?.id || null
      });
      const created = res.data;
      const bookingId = created?.id?.slice(-6)?.toUpperCase() || 'MBC001';

    // WhatsApp message to customer
    const customerMsg = encodeURIComponent(
`🏗️ MBC - Mahathi Building Contractors

Hello ${booking.contact_name},

Your booking has been successfully received.

🔖 Booking ID: ${bookingId}
🛠️ Service: ${booking.service_name}
📅 Date: ${booking.date}
🕐 Time: ${booking.time_slot}
📍 Location: ${booking.address}

Our team will contact you shortly.

Thank you for choosing Mahathi Building Contractors.

"Today Under Construction. Tomorrow Your Dream Home."

For Support:
📞 8688074469
🌐 mahathicontractors.in`
    );

    // Admin notification message
    const adminMsg = encodeURIComponent(
`🔔 New Booking Alert — MBC

Booking ID: ${bookingId}
Service: ${booking.service_name}
Customer: ${booking.contact_name}
Phone: ${booking.contact_phone}
Date: ${booking.date} | ${booking.time_slot}
Location: ${booking.address}
${booking.notes ? `Notes: ${booking.notes}` : ''}

Status: Pending`
    );

    const customerPhone = booking.contact_phone.replace(/\D/g, '');

    // Open customer WhatsApp
    if (customerPhone.length >= 10) {
      window.open(`https://wa.me/91${customerPhone}?text=${customerMsg}`, '_blank');
    }
    // Admin 1
    setTimeout(() => window.open(`https://wa.me/918688074469?text=${adminMsg}`, '_blank'), 500);
    // Admin 2
    setTimeout(() => window.open(`https://wa.me/919398158902?text=${adminMsg}`, '_blank'), 1000);

    toast.success('Booking confirmed! WhatsApp notifications sent.');
    setStep(4);
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to submit booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 to-transparent pointer-events-none" />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Progress */}
          <div className="flex items-center justify-center gap-2 mb-12">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  i <= step ? 'bg-blue-500/20 text-blue-400' : 'text-white/30'
                } ${i === step ? 'border border-blue-500/30' : 'border border-transparent'}`}>
                  <s.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
                {i < steps.length - 1 && <ChevronRight className="w-4 h-4 text-white/10" />}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {/* Step 0: Service */}
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white font-heading mb-2">Select a Service</h2>
                <p className="text-sm text-white/40 mb-6">Choose the service you'd like to book</p>
                <div className="grid grid-cols-2 gap-3">
                  {services.map((s) => (
                    <button
                      key={s}
                      onClick={() => setBooking({ ...booking, service_name: s })}
                      className={`p-4 rounded-xl text-sm font-medium text-left transition-all ${
                        booking.service_name === s
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          : 'bg-white/3 text-white/60 border border-white/5 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 1: Schedule */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white font-heading mb-2">Pick Date & Time</h2>
                <p className="text-sm text-white/40 mb-6">Select your preferred date and time slot</p>

                {/* Date picker */}
                <div className="mb-6">
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Date</label>
                  <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                    {dates.map((d) => {
                      const dateStr = format(d, 'yyyy-MM-dd');
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setBooking({ ...booking, date: dateStr })}
                          className={`flex flex-col items-center px-4 py-3 rounded-xl text-xs shrink-0 transition-all ${
                            booking.date === dateStr
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                              : 'bg-white/3 text-white/50 border border-white/5 hover:bg-white/5'
                          }`}
                        >
                          <span className="text-[10px] uppercase">{format(d, 'EEE')}</span>
                          <span className="text-lg font-bold mt-0.5">{format(d, 'd')}</span>
                          <span className="text-[10px]">{format(d, 'MMM')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Time slots */}
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider mb-3 block">Time Slot</label>
                  <div className="space-y-4">
                    {Object.entries(timeSlots).map(([period, slots]) => (
                      <div key={period}>
                        <p className="text-xs text-white/30 mb-2">{period}</p>
                        <div className="flex flex-wrap gap-2">
                          {slots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => setBooking({ ...booking, time_slot: slot })}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                booking.time_slot === slot
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : 'bg-white/3 text-white/50 border border-white/5 hover:bg-white/5'
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white font-heading mb-2">Your Details</h2>
                <p className="text-sm text-white/40 mb-6">Tell us about yourself and the project location</p>
                <div className="space-y-4">
                  <Input
                    placeholder="Full Name *"
                    value={booking.contact_name}
                    onChange={(e) => setBooking({ ...booking, contact_name: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                  />
                  <Input
                    placeholder="Phone Number *"
                    value={booking.contact_phone}
                    onChange={(e) => setBooking({ ...booking, contact_phone: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
                  />
                  <Textarea
                    placeholder="Full Address *"
                    value={booking.address}
                    onChange={(e) => setBooking({ ...booking, address: e.target.value })}
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl min-h-[80px]"
                  />
                  <Textarea
                    placeholder="Additional Notes (optional)"
                    value={booking.notes}
                    onChange={(e) => setBooking({ ...booking, notes: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl min-h-[80px]"
                  />
                </div>
              </motion.div>
            )}

            {/* Step 3: Confirm */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="glass rounded-2xl p-6 md:p-8">
                <h2 className="text-2xl font-bold text-white font-heading mb-2">Confirm Booking</h2>
                <p className="text-sm text-white/40 mb-6">Review your booking details</p>
                <div className="space-y-4">
                  {[
                    { label: 'Service', value: booking.service_name },
                    { label: 'Date', value: booking.date ? format(new Date(booking.date), 'EEEE, MMMM d, yyyy') : '' },
                    { label: 'Time', value: booking.time_slot },
                    { label: 'Name', value: booking.contact_name },
                    { label: 'Phone', value: booking.contact_phone },
                    { label: 'Address', value: booking.address },
                  ].map((item) => (
                    <div key={item.label} className="flex justify-between items-start py-3 border-b border-white/5 last:border-0">
                      <span className="text-sm text-white/40">{item.label}</span>
                      <span className="text-sm text-white font-medium text-right max-w-[60%]">{item.value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 md:p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white font-heading mb-3">Booking Confirmed!</h2>
                <p className="text-white/40 mb-8">
                  Our team will contact you shortly to discuss your {booking.service_name} requirements.
                </p>
                <a href="https://wa.me/918688074469">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-500 text-white border-0 rounded-xl px-8 h-12 font-semibold">
                    Chat on WhatsApp
                  </Button>
                </a>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          {step < 4 && (
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => setStep(step - 1)}
                disabled={step === 0}
                className="border-white/10 text-white/60 hover:text-white hover:bg-white/5 rounded-xl gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              {step < 3 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl px-8 font-semibold shadow-lg shadow-blue-500/25 gap-2"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl px-8 font-semibold shadow-lg shadow-blue-500/25 gap-2"
                >
                  {submitting ? 'Confirming...' : 'Confirm Booking'} <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}