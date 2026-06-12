import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, FileText, Check, ArrowRight, ArrowLeft, ChevronRight, Navigation, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { addDays, format } from 'date-fns';

const services = [
  'House Construction', 'Duplex Construction', 'Villa Construction', 'Commercial Buildings',
  'Interior Design', 'Architecture Planning', '3D Elevation', 'Excavation & Foundation',
  'RCC & Slab Casting', 'Brick Work & Plastering', 'Bathroom Plumbing', 'Kitchen Plumbing',
  'Smart Wiring', 'Solar Installation', 'CCTV Installation', 'Tile Flooring', 'Granite & Marble',
  'Interior Painting', 'Exterior Painting', 'Texture Painting', 'Modular Kitchen', 'Wardrobes',
  'False Ceiling', 'Terrace Waterproofing', 'Bathroom Waterproofing', 'Smart Locks',
  'Home Theatre', 'EV Charger', 'Maintenance',
];

const timeSlots = {
  Morning: ['9:00 AM', '10:00 AM', '11:00 AM'],
  Afternoon: ['12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'],
  Evening: ['5:00 PM', '6:00 PM', '7:00 PM'],
};

const steps = [
  { label: 'Service', icon: FileText },
  { label: 'Schedule', icon: Calendar },
  { label: 'Details', icon: MapPin },
  { label: 'Confirm', icon: Check },
];

const cleanMobile = (value) => value.replace(/\D/g, '').slice(0, 10);
const VIJAYAWADA_VIEWBOX = '80.45,16.65,80.85,16.35';
const LOCAL_CONTEXT_REGEX = /\b(vijayawada|andhra\s*pradesh|ap|india)\b/i;

const withLocalAddressContext = (query) => {
  const trimmed = query.trim();
  return LOCAL_CONTEXT_REGEX.test(trimmed)
    ? trimmed
    : `${trimmed}, Vijayawada, Andhra Pradesh, India`;
};

const getAddressParts = (suggestion) => {
  const address = suggestion.address || {};
  const place = suggestion.name || suggestion.display_name?.split(',')?.[0] || 'Address result';
  const area = address.suburb || address.neighbourhood || address.quarter || address.road || address.hamlet || address.village || address.town || '';
  const city = address.city || address.town || address.village || address.county || 'Vijayawada';
  const state = address.state || 'Andhra Pradesh';

  return { place, area, city, state };
};

const scoreLocalResult = (suggestion) => {
  const address = suggestion.address || {};
  const text = `${suggestion.display_name || ''} ${address.city || ''} ${address.town || ''} ${address.state || ''}`.toLowerCase();
  let score = 0;
  if (text.includes('vijayawada')) score += 3;
  if (text.includes('andhra pradesh')) score += 2;
  if (text.includes('india')) score += 1;
  return score;
};

const isTodayDate = (dateStr) => dateStr === format(new Date(), 'yyyy-MM-dd');

const getSlotDate = (dateStr, slot) => {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!dateStr || !match) return null;

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0);
};

const isUpcomingSlot = (dateStr, slot) => {
  if (!isTodayDate(dateStr)) return true;
  const slotDate = getSlotDate(dateStr, slot);
  return slotDate ? slotDate.getTime() > Date.now() : true;
};

export default function Book() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedService = searchParams.get('service')?.trim() || '';
  const [serviceLocked, setServiceLocked] = useState(Boolean(requestedService));
  const [step, setStep] = useState(requestedService ? 1 : 0);
  const [booking, setBooking] = useState({
    service_name: requestedService,
    date: '',
    time_slot: '',
    contact_name: '',
    contact_phone: '',
    address: '',
    latitude: null,
    longitude: null,
    location_accuracy: null,
    notes: '',
    send_whatsapp_updates: true,
    whatsapp_opt_in: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [locating, setLocating] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [addressSearchStatus, setAddressSearchStatus] = useState('idle');
  const [selectedAddressValue, setSelectedAddressValue] = useState('');

  useEffect(() => {
    if (!requestedService) return;
    setBooking((prev) => ({ ...prev, service_name: prev.service_name || requestedService }));
    setServiceLocked(true);
    setStep((prev) => (prev === 0 ? 1 : prev));
  }, [requestedService]);

  useEffect(() => {
    if (user) {
      setBooking((prev) => ({
        ...prev,
        contact_name: prev.contact_name || user.name || '',
        contact_phone: prev.contact_phone || cleanMobile(user.mobile_number || ''),
      }));
    }
  }, [user]);

  const dates = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const addressQuery = booking.address.trim();

    if (addressQuery.length < 3 || addressQuery === selectedAddressValue.trim()) {
      setAddressSuggestions([]);
      setAddressSearchStatus('idle');
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setAddressLoading(true);
        setAddressSearchStatus('loading');
        const params = new URLSearchParams({
          q: withLocalAddressContext(addressQuery),
          format: 'json',
          addressdetails: '1',
          limit: '6',
          countrycodes: 'in',
          viewbox: VIJAYAWADA_VIEWBOX,
          bounded: '0',
          'accept-language': 'en'
        });
        const res = await fetch(`https://nominatim.openstreetmap.org/search?${params.toString()}`, {
          headers: { Accept: 'application/json' }
        });
        if (!res.ok) throw new Error('Address search failed');
        const data = await res.json();
        const prioritized = [...(data || [])].sort((a, b) => scoreLocalResult(b) - scoreLocalResult(a));
        setAddressSuggestions(prioritized);
        setAddressSearchStatus('done');
      } catch (err) {
        console.warn('Address autocomplete failed:', err);
        setAddressSuggestions([]);
        setAddressSearchStatus('error');
      } finally {
        setAddressLoading(false);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [booking.address]);

  const updateAddress = (address) => {
    setBooking((prev) => ({
      ...prev,
      address,
      latitude: null,
      longitude: null,
      location_accuracy: null,
    }));
    setSelectedAddressValue('');
  };

  const selectAddressSuggestion = (suggestion) => {
    const selectedAddress = suggestion.display_name;
    setBooking((prev) => ({
      ...prev,
      address: selectedAddress,
      latitude: Number(suggestion.lat),
      longitude: Number(suggestion.lon),
      location_accuracy: null,
    }));
    setSelectedAddressValue(selectedAddress);
    setAddressSuggestions([]);
    setAddressSearchStatus('idle');
  };

  const reverseGeocode = async (latitude, longitude) => {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: 'json',
      addressdetails: '1',
      zoom: '18',
      'accept-language': 'en'
    });
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
      headers: { Accept: 'application/json' }
    });
    if (!res.ok) throw new Error('Reverse geocoding failed');
    const data = await res.json();
    return data.display_name || `${latitude}, ${longitude}`;
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location is not supported in this browser. Please type your address manually.');
      return;
    }

    if (booking.address.trim() && (!booking.latitude || !booking.longitude)) {
      const replaceAddress = window.confirm('Use current location and replace the typed address?');
      if (!replaceAddress) return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        try {
          const address = await reverseGeocode(latitude, longitude);
          setBooking((prev) => ({ ...prev, address, latitude, longitude, location_accuracy: accuracy ?? null }));
          setSelectedAddressValue(address);
          setAddressSuggestions([]);
          if (accuracy && accuracy > 100) {
            toast.warning('Location accuracy is low. Please confirm manually.');
          } else {
            toast.success('Current location added.');
          }
        } catch (err) {
          console.warn('Reverse geocoding failed:', err);
          const coordinateAddress = `${latitude}, ${longitude}`;
          setBooking((prev) => ({ ...prev, address: coordinateAddress, latitude, longitude, location_accuracy: accuracy ?? null }));
          setSelectedAddressValue(coordinateAddress);
          if (accuracy && accuracy > 100) {
            toast.warning('Location accuracy is low. Please confirm manually.');
          } else {
            toast.success('Location captured. Please confirm the address.');
          }
        } finally {
          setLocating(false);
        }
      },
      (error) => {
        setLocating(false);
        if (error.code === error.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please type your address manually.');
        } else {
          toast.error('Could not get current location. Please type your address manually.');
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (booking.date && booking.time_slot && !isUpcomingSlot(booking.date, booking.time_slot)) {
      setBooking((prev) => ({ ...prev, time_slot: '' }));
    }
  }, [booking.date, booking.time_slot]);

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
        whatsapp_opt_in: booking.whatsapp_opt_in,
        send_whatsapp_updates: booking.whatsapp_opt_in,
        location_accuracy: booking.location_accuracy,
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
      <section className="relative overflow-visible py-16">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-slate-950/10 to-blue-950/20 pointer-events-none" />
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">Mahathi Building Contractors</p>
            <h1 className="font-heading text-3xl font-bold text-white md:text-5xl">Book a professional site visit</h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-white/50">
              Share your service, schedule, and location. Guests can book without login and our Vijayawada team will contact you with the next steps.
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

          {serviceLocked && booking.service_name && step > 0 && step < 4 && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-amber-200/70">Selected Service</p>
                <p className="mt-1 font-heading text-lg font-semibold text-white">{booking.service_name}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setServiceLocked(false);
                  setStep(0);
                }}
                className="rounded-xl border-white/10 text-white/70 hover:bg-white/5 hover:text-white"
              >
                Change Service
              </Button>
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="service" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass relative overflow-visible rounded-2xl p-6 md:p-8">
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
              <motion.div key="schedule" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass relative overflow-visible rounded-2xl p-6 md:p-8">
                <h2 className="font-heading text-2xl font-bold text-white">Pick date and time</h2>
                <p className="mb-6 mt-2 text-sm text-white/45">Select a convenient slot for our team to contact or visit you.</p>
                <label className="mb-3 block text-xs uppercase tracking-wider text-white/40">Date</label>
                <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                  {dates.map((date) => {
                    const dateStr = format(date, 'yyyy-MM-dd');
                    return (
                      <button
                        key={dateStr}
                        onClick={() => setBooking({ ...booking, date: dateStr, time_slot: isUpcomingSlot(dateStr, booking.time_slot) ? booking.time_slot : '' })}
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
                {isTodayDate(booking.date) && (
                  <p className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-200">
                    For today, only upcoming time slots are available.
                  </p>
                )}
                <div className="space-y-4">
                  {Object.entries(timeSlots).map(([period, slots]) => (
                    <div key={period}>
                      <p className="mb-2 text-xs text-white/35">{period}</p>
                      <div className="flex flex-wrap gap-2">
                        {slots.map((slot) => {
                          const disabled = booking.date && !isUpcomingSlot(booking.date, slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => !disabled && setBooking({ ...booking, time_slot: slot })}
                              disabled={disabled}
                              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                                booking.time_slot === slot
                                  ? 'border-blue-500/40 bg-blue-500/20 text-blue-300'
                                  : disabled
                                    ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-white/20 line-through'
                                    : 'border-white/5 bg-white/[0.03] text-white/50 hover:bg-white/[0.07] hover:text-white'
                              }`}
                            >
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="details" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass relative overflow-visible rounded-2xl p-6 md:p-8">
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
                  <div className="space-y-3">
                    <Button type="button" variant="outline" onClick={useCurrentLocation} disabled={locating} className="w-full justify-center gap-2 rounded-xl border-white/10 text-white/70 hover:bg-white/5 hover:text-white">
                      {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                      Use Current Location
                    </Button>
                    <div className="relative z-[100] overflow-visible">
                      <Textarea placeholder="Address / City *" value={booking.address} onChange={(e) => updateAddress(e.target.value)} className="min-h-[90px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30" />
                      <p className="mt-2 text-xs text-white/35">Select the closest address from suggestions or type manually.</p>
                      {booking.address.trim().length >= 3 && addressSearchStatus !== 'idle' && (
                        <div className="absolute left-0 right-0 top-full z-[9999] mt-2 max-h-[240px] overflow-y-auto rounded-xl border border-amber-400/20 bg-[#0A0E1A] shadow-2xl shadow-black/50">
                          {addressLoading && <div className="px-4 py-3 text-xs text-white/40">Searching address...</div>}
                          {!addressLoading && addressSearchStatus === 'error' && (
                            <div className="px-4 py-3 text-xs text-red-300">Address search failed. Please type manually.</div>
                          )}
                          {!addressLoading && addressSearchStatus === 'done' && addressSuggestions.length === 0 && (
                            <div className="px-4 py-3 text-xs text-white/45">No address found. Please type manually.</div>
                          )}
                          {!addressLoading && addressSuggestions.map((suggestion) => {
                            const { place, area, city, state } = getAddressParts(suggestion);
                            const locationLine = [area, city, state].filter(Boolean).join(' - ');

                            return (
                              <button
                                key={suggestion.place_id}
                                type="button"
                                onClick={() => selectAddressSuggestion(suggestion)}
                                className="block w-full border-b border-white/5 px-4 py-3 text-left transition hover:bg-white/5 last:border-0"
                              >
                                <span className="block text-sm font-semibold text-white/80">{place}</span>
                                <span className="mt-1 block text-xs text-white/45">{locationLine}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                    {booking.latitude && booking.longitude && (
                      <p className="text-xs text-green-400">
                        Location saved: {Number(booking.latitude).toFixed(5)}, {Number(booking.longitude).toFixed(5)}
                        {booking.location_accuracy ? ` - accuracy ${Math.round(booking.location_accuracy)}m` : ''}
                      </p>
                    )}
                  </div>
                  <Textarea placeholder="Notes (optional)" value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} className="min-h-[90px] rounded-xl border-white/10 bg-white/5 text-white placeholder:text-white/30" />
                  <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={booking.whatsapp_opt_in}
                      onChange={(e) => setBooking({ ...booking, whatsapp_opt_in: e.target.checked, send_whatsapp_updates: e.target.checked })}
                      className="mt-1 h-4 w-4"
                    />
                    <span>Send booking updates on WhatsApp</span>
                  </label>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} className="glass relative overflow-visible rounded-2xl p-6 md:p-8">
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
                    ['WhatsApp Updates', booking.whatsapp_opt_in ? 'Yes' : 'No'],
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
