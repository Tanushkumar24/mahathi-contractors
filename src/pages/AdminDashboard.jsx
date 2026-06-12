import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Calendar, MapPin, Clock, Users, ClipboardList,
  TrendingUp, Search, ChevronDown, LayoutDashboard, FolderKanban,
  Star, Settings, LogOut, Menu, X, Mail, UserCheck,
  Plus, Pencil, Trash2, Eye, BarChart2, CheckCircle2, AlertCircle, Wrench,
  Navigation, WifiOff, Upload
} from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const statusConfig = {
  pending:     { label: 'Pending',            color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
  confirmed:   { label: 'Confirmed',          color: 'text-blue-400',   bg: 'bg-blue-500/10 border-blue-500/20' },
  site_visit:  { label: 'Site Visit Scheduled', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20' },
  in_progress: { label: 'In Progress',        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  completed:   { label: 'Completed',          color: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/20' },
  cancelled:   { label: 'Cancelled',          color: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/20' },
};

const ADMIN_PHONES = ['918688074469', '919398158902'];

const emptyProjectForm = {
  title: '',
  category: 'Residential',
  location: '',
  status: 'ongoing',
  year: new Date().getFullYear().toString(),
  progress_percent: 0,
  description: '',
  client_name: '',
  image_url: '',
  image_urls: [],
  video_urls: []
};

const emptyReviewForm = {
  name: '',
  customer_name: '',
  rating: 5,
  comment: '',
  review_text: '',
  service_category: '',
  location: '',
  photo_url: '',
  status: 'approved',
  active: true,
  is_featured: false
};

const emptyServiceForm = {
  name: '',
  category: '',
  description: '',
  approx_price: '',
  icon: '',
  image_url: '',
  active: true,
  status: 'active'
};

function normalizeArray(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return value ? [value] : [];
    }
  }
  return [];
}

async function uploadAdminFile(file, meta = {}) {
  const formData = new FormData();
  formData.append('file', file);
  Object.entries(meta).forEach(([key, value]) => {
    if (value) formData.append(key, value);
  });
  const res = await api.post('/api/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

function sendAdminWhatsApp(booking, newStatus) {
  const statusLabel = statusConfig[newStatus]?.label || newStatus;
  const msg = encodeURIComponent(
`📋 MBC Booking Update

Booking ID: ${booking.id?.slice(-6)?.toUpperCase()}
Customer: ${booking.contact_name || 'N/A'}
Phone: ${booking.contact_phone || 'N/A'}
Service: ${booking.service_name}
Date: ${booking.date} | ${booking.time_slot}
Location: ${booking.address}

✅ New Status: ${statusLabel}`
  );
  ADMIN_PHONES.forEach((ph, i) => {
    setTimeout(() => window.open(`https://wa.me/${ph}?text=${msg}`, '_blank'), i * 400);
  });
  // Customer notification
  if (booking.contact_phone) {
    const custPhone = booking.contact_phone.replace(/\D/g, '');
    const custMsg = encodeURIComponent(
`🏗️ MBC - Mahathi Building Contractors

Hello ${booking.contact_name || 'Customer'},

Your booking status has been updated.

🔖 Booking ID: ${booking.id?.slice(-6)?.toUpperCase()}
🛠️ Service: ${booking.service_name}
📅 Date: ${booking.date}
✅ Status: ${statusLabel}

For queries: 📞 8688074469
🌐 mahathicontractors.in`
    );
    if (custPhone.length >= 10) {
      setTimeout(() => window.open(`https://wa.me/91${custPhone}?text=${custMsg}`, '_blank'), 800);
    }
  }
}

// --- Sub-pages ---
function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    api.get('/api/bookings').then(res => {
      setBookings(res.data);
      setLoading(false);
    });
  }, []);

  const updateStatus = async (booking, status) => {
    await api.patch(`/api/bookings/${booking.id}`, { status });
    setBookings(prev => prev.map(b => b.id === booking.id ? { ...b, status } : b));
    console.log('WhatsApp automation paused. Booking status saved without sending message.', { bookingId: booking.id, status });
  };

  const filtered = bookings.filter(b => {
    const q = search.toLowerCase();
    const matchSearch = !search || b.contact_name?.toLowerCase().includes(q) || b.contact_phone?.includes(search) || b.service_name?.toLowerCase().includes(q) || b.address?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'All' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    in_progress: bookings.filter(b => b.status === 'in_progress').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-white font-heading mb-6">Bookings & Enquiries</h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total', value: counts.total, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Pending', value: counts.pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { label: 'In Progress', value: counts.in_progress, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { label: 'Completed', value: counts.completed, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map(s => (
          <div key={s.label} className={`glass rounded-xl p-4 ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input type="text" placeholder="Search name, phone, service..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 glass rounded-xl text-sm text-white/80 placeholder:text-white/20 border border-white/5 focus:border-blue-500/30 focus:outline-none bg-transparent" />
        </div>
        <div className="relative">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="appearance-none glass rounded-xl px-4 py-2.5 pr-9 text-sm text-white/70 border border-white/5 focus:outline-none bg-transparent cursor-pointer">
            <option value="All" className="bg-[#0A0E1A]">All Status</option>
            {Object.keys(statusConfig).map(s => <option key={s} value={s} className="bg-[#0A0E1A]">{statusConfig[s].label}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="glass rounded-2xl p-5 animate-pulse h-24" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center"><div className="text-5xl mb-3">📭</div><p className="text-white/40">No bookings found.</p></div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b, i) => {
            const cfg = statusConfig[b.status] || statusConfig.pending;
            const hasCoordinates = b.latitude !== null && b.latitude !== undefined && b.longitude !== null && b.longitude !== undefined;
            const accuracy = b.location_accuracy !== null && b.location_accuracy !== undefined ? Math.round(Number(b.location_accuracy)) : null;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass rounded-2xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-semibold text-white">{b.contact_name || 'Unknown'}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
                    </div>
                    <div className="text-sm font-medium text-blue-400 mb-2">{b.service_name}</div>
                    <div className="flex flex-wrap gap-3 text-xs text-white/40">
                      {b.contact_phone && <span className="flex items-center gap-1 text-white/60 font-medium"><Phone className="w-3 h-3" />{b.contact_phone}</span>}
                      {b.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(b.date), 'dd MMM yyyy')}</span>}
                      {b.time_slot && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time_slot}</span>}
                      {b.address && <span className="flex items-center gap-1 max-w-md truncate"><MapPin className="w-3 h-3 shrink-0" />Address: {b.address}</span>}
                      {hasCoordinates && <span className="flex items-center gap-1 text-cyan-300/80"><Navigation className="w-3 h-3" />Lat: {Number(b.latitude).toFixed(5)}, Lng: {Number(b.longitude).toFixed(5)}</span>}
                      {accuracy !== null && !Number.isNaN(accuracy) && <span className="flex items-center gap-1 text-white/40">Accuracy: {accuracy}m</span>}
                      <span className={`flex items-center gap-1 font-medium ${(b.whatsapp_opt_in ?? b.send_whatsapp_updates) ? 'text-green-400' : 'text-red-300'}`}>
                        <MessageCircle className="w-3 h-3" /> WhatsApp: {(b.whatsapp_opt_in ?? b.send_whatsapp_updates) ? 'ON' : 'OFF'}
                      </span>
                    </div>
                    {b.notes && <p className="text-xs text-white/30 mt-2 truncate max-w-md">📝 {b.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    {b.address && (
                      <button
                        onClick={() => openBookingDirections(b)}
                        className="h-9 rounded-xl bg-amber-500/10 px-3 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-colors flex items-center gap-2"
                        title="Open Directions"
                      >
                        <Navigation className="w-4 h-4" /> Directions
                      </button>
                    )}
                    {b.contact_phone && (
                      <>
                        <a href={`https://wa.me/91${b.contact_phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-green-500/10 flex items-center justify-center hover:bg-green-500/20 transition-colors" title="WhatsApp">
                          <MessageCircle className="w-4 h-4 text-green-400" />
                        </a>
                        <a href={`tel:${b.contact_phone}`} className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20 transition-colors" title="Call">
                          <Phone className="w-4 h-4 text-blue-400" />
                        </a>
                      </>
                    )}
                    <div className="relative">
                      <select value={b.status} onChange={e => updateStatus(b, e.target.value)}
                        className="appearance-none glass rounded-xl pl-3 pr-7 py-2 text-xs text-white/60 border border-white/5 focus:outline-none bg-transparent cursor-pointer">
                        {Object.keys(statusConfig).map(s => <option key={s} value={s} className="bg-[#0A0E1A]">{statusConfig[s].label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-white/20 text-center mt-5">Showing {filtered.length} of {bookings.length} bookings</p>
    </div>
  );
}

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/leads').then(res => { setLeads(res.data); setLoading(false); });
  }, []);

  const updateLead = async (id, status) => {
    await api.patch(`/api/leads/${id}`, { status });
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
  };

  const leadStatusColors = { new: 'text-yellow-400', contacted: 'text-blue-400', converted: 'text-green-400', closed: 'text-white/30' };

  return (
    <div>
      <h2 className="text-xl font-bold text-white font-heading mb-6">Leads & Enquiries</h2>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass rounded-xl p-5 animate-pulse h-20" />)}</div>
      : leads.length === 0 ? <div className="glass rounded-2xl p-12 text-center"><div className="text-5xl mb-3">📬</div><p className="text-white/40">No leads yet.</p></div>
      : <div className="space-y-3">
          {leads.map((l, i) => (
            <motion.div key={l.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }} className="glass rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-white">{l.name}</span>
                    <span className={`text-xs font-medium ${leadStatusColors[l.status] || 'text-white/40'}`}>• {l.status}</span>
                  </div>
                  {l.service_needed && <p className="text-xs text-blue-400 mb-1">{l.service_needed}</p>}
                  <div className="flex flex-wrap gap-3 text-xs text-white/40">
                    {l.phone && <span className="flex items-center gap-1 text-white/60"><Phone className="w-3 h-3" />{l.phone}</span>}
                    {l.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{l.email}</span>}
                    {l.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{l.location}</span>}
                  </div>
                  {l.message && <p className="text-xs text-white/30 mt-1 truncate">💬 {l.message}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {l.phone && (
                    <>
                      <a href={`https://wa.me/91${l.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center hover:bg-green-500/20">
                        <MessageCircle className="w-3.5 h-3.5 text-green-400" />
                      </a>
                      <a href={`tel:${l.phone}`} className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center hover:bg-blue-500/20">
                        <Phone className="w-3.5 h-3.5 text-blue-400" />
                      </a>
                    </>
                  )}
                  <div className="relative">
                    <select value={l.status} onChange={e => updateLead(l.id, e.target.value)}
                      className="appearance-none glass rounded-lg pl-2 pr-6 py-1.5 text-xs text-white/60 border border-white/5 focus:outline-none bg-transparent cursor-pointer">
                      {['new', 'contacted', 'converted', 'closed'].map(s => <option key={s} value={s} className="bg-[#0A0E1A]">{s}</option>)}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      }
    </div>
  );
}

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(emptyProjectForm);
  const [uploading, setUploading] = useState('');
  const [savingProject, setSavingProject] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/projects');
      console.log('[Admin Projects] Loaded projects:', res.data);
      setProjects(res.data || []);
    } catch (err) {
      console.error('[Admin Projects] Failed to load projects:', err.response?.data || err.message, err);
      toast.error(err.response?.data?.error || 'Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const resetProjectForm = () => {
    setShowForm(false);
    setEditProject(null);
    setForm(emptyProjectForm);
  };

  const saveProject = async () => {
    if (!form.title?.trim()) {
      toast.error('Project title is required.');
      return;
    }

    const payload = {
      ...form,
      title: form.title.trim(),
      client_name: form.client_name?.trim() || '',
      location: form.location?.trim() || '',
      category: form.category || 'Residential',
      status: form.status || 'ongoing',
      year: form.year?.toString().trim() || new Date().getFullYear().toString(),
      description: form.description?.trim() || '',
      progress_percent: Number(form.progress_percent || 0),
      image_urls: normalizeArray(form.image_urls),
      video_urls: normalizeArray(form.video_urls)
    };

    console.log('[Admin Projects] Saving project payload:', payload);
    setSavingProject(true);
    try {
      if (editProject) {
        const res = await api.put(`/api/projects/${editProject.id}`, payload);
        console.log('[Admin Projects] Update response:', res.data);
        toast.success('Project updated.');
      } else {
        const res = await api.post('/api/projects', payload);
        console.log('[Admin Projects] Create response:', res.data);
        toast.success('Project added.');
      }
      resetProjectForm();
      await loadProjects();
    } catch (err) {
      console.error('[Admin Projects] Save failed:', err.response?.data || err.message, err);
      toast.error(err.response?.data?.error || err.response?.data?.details || 'Project save failed.');
    } finally {
      setSavingProject(false);
    }
  };

  const deleteProject = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    await api.delete(`/api/projects/${id}`);
    setProjects(prev => prev.filter(p => p.id !== id));
    toast.success('Project deleted.');
  };

  const startEdit = (p) => {
    setEditProject(p);
    setForm({
        ...emptyProjectForm,
        ...p,
        image_urls: normalizeArray(p.image_urls || p.media_urls || p.image_url),
        video_urls: normalizeArray(p.video_urls)
      });
    setShowForm(true);
  };

  const uploadProjectMedia = async (file) => {
    if (!file) return;
    setUploading(file.type.startsWith('video/') ? 'video' : 'image');
    try {
      console.log('[Admin Projects] Uploading project media:', { name: file.name, type: file.type, size: file.size });
      const uploaded = await uploadAdminFile(file, { linked_type: 'project', linked_id: editProject?.id });
      console.log('[Admin Projects] Upload response:', uploaded);
      if (uploaded.resource_type === 'video') {
        setForm(prev => ({ ...prev, video_urls: [...normalizeArray(prev.video_urls), uploaded.secure_url || uploaded.url] }));
        } else {
          const url = uploaded.secure_url || uploaded.url;
          setForm(prev => ({ ...prev, image_url: prev.image_url || url, image_urls: [...normalizeArray(prev.image_urls), url] }));
        }
      toast.success('Media uploaded.');
    } catch (err) {
      console.error('[Admin Projects] Upload failed:', err.response?.data || err.message, err);
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading('');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white font-heading">Projects</h2>
        <Button onClick={() => { setShowForm(true); setEditProject(null); setForm(emptyProjectForm); }} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Project
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-base font-semibold text-white">{editProject ? 'Edit Project' : 'New Project'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Project Title *" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:border-blue-500/30 focus:outline-none bg-transparent" />
            <input placeholder="Client Name" value={form.client_name} onChange={e => setForm({...form, client_name: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <input placeholder="Year" value={form.year || ''} onChange={e => setForm({...form, year: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white/70 border border-white/5 focus:outline-none bg-transparent">
              {['Residential','Commercial','Interior','Villa','Renovation'].map(c => <option key={c} value={c} className="bg-[#0A0E1A]">{c}</option>)}
            </select>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white/70 border border-white/5 focus:outline-none bg-transparent">
              <option value="ongoing" className="bg-[#0A0E1A]">Ongoing</option>
              <option value="completed" className="bg-[#0A0E1A]">Completed</option>
            </select>
            <input type="number" placeholder="Progress %" min="0" max="100" value={form.progress_percent} onChange={e => setForm({...form, progress_percent: Number(e.target.value)})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <input placeholder="Cover image URL" value={form.image_url || ''} onChange={e => setForm({...form, image_url: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
          </div>
          <textarea placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent min-h-[80px]" />
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">Project Photos / Videos</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Photo or Video'}
              <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => uploadProjectMedia(e.target.files?.[0])} disabled={!!uploading} />
            </label>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              {normalizeArray(form.image_urls).map((url) => (
                <img key={url} src={url} alt="Project media" className="h-24 w-full rounded-xl object-cover" />
              ))}
              {normalizeArray(form.video_urls).map((url) => (
                <video key={url} src={url} controls className="h-24 w-full rounded-xl object-cover" />
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={saveProject} disabled={!form.title || savingProject} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
              {savingProject ? 'Saving project...' : 'Save'}
            </Button>
            <Button variant="outline" onClick={resetProjectForm} className="border-white/10 text-white/60 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass rounded-xl p-5 animate-pulse h-20" />)}</div>
      : projects.length === 0 ? <div className="glass rounded-2xl p-12 text-center"><div className="text-5xl mb-3">🏗️</div><p className="text-white/40">No projects yet. Add one above.</p></div>
      : <div className="space-y-3">
          {projects.map((p, i) => (
            <div key={p.id} className="glass rounded-xl p-4 flex items-center gap-4">
              {(p.image_url || normalizeArray(p.image_urls || p.media_urls)[0]) && (
                <img src={p.image_url || normalizeArray(p.image_urls || p.media_urls)[0]} alt={p.title} className="h-16 w-20 rounded-xl object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-white">{p.title}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full border ${p.status === 'completed' ? 'text-green-400 bg-green-500/10 border-green-500/20' : 'text-blue-400 bg-blue-500/10 border-blue-500/20'}`}>{p.status}</span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-white/40">
                  {p.category && <span>{p.category}</span>}
                  {p.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{p.location}</span>}
                  {p.client_name && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{p.client_name}</span>}
                </div>
                {p.progress_percent > 0 && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.progress_percent}%` }} /></div>
                    <span className="text-[10px] text-blue-400">{p.progress_percent}%</span>
                  </div>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => startEdit(p)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"><Pencil className="w-3.5 h-3.5 text-white/50" /></button>
                <button onClick={() => deleteProject(p.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 transition-colors"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', service_category: '', location: '', is_featured: false });

  useEffect(() => {
    api.get('/api/admin/reviews').then(res => { setReviews(res.data); setLoading(false); });
  }, []);

  const saveReview = async () => {
    const res = await api.post('/api/reviews', form);
    setReviews(prev => [res.data, ...prev]);
    setShowForm(false);
    setForm({ name: '', rating: 5, comment: '', service_category: '', location: '', is_featured: false });
  };

  const deleteReview = async (id) => {
    await api.delete(`/api/reviews/${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white font-heading">Testimonials</h2>
        <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 text-sm"><Plus className="w-4 h-4" /> Add Review</Button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-4">
          <h3 className="text-base font-semibold text-white">New Testimonial</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input placeholder="Customer Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <input type="number" min="1" max="5" placeholder="Rating (1-5)" value={form.rating} onChange={e => setForm({...form, rating: Number(e.target.value)})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <input placeholder="Service Category" value={form.service_category} onChange={e => setForm({...form, service_category: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
            <input placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} className="glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent" />
          </div>
          <textarea placeholder="Review Comment *" value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent min-h-[80px]" />
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" checked={form.is_featured} onChange={e => setForm({...form, is_featured: e.target.checked})} className="rounded" />
            Feature on homepage
          </label>
          <div className="flex gap-3">
            <Button onClick={saveReview} disabled={!form.name || !form.comment} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Save</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-white/60 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass rounded-xl p-4 animate-pulse h-16" />)}</div>
      : reviews.length === 0 ? <div className="glass rounded-2xl p-12 text-center"><div className="text-5xl mb-3">⭐</div><p className="text-white/40">No reviews yet.</p></div>
      : <div className="space-y-3">
          {reviews.map(r => (
            <div key={r.id} className="glass rounded-xl p-4 flex items-start gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-white">{r.name}</span>
                  <span className="text-yellow-400 text-xs">{'★'.repeat(r.rating)}</span>
                  {r.is_featured && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Featured</span>}
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{r.comment}</p>
                {(r.service_category || r.location) && (
                  <div className="flex gap-3 mt-1 text-[10px] text-white/30">
                    {r.service_category && <span>{r.service_category}</span>}
                    {r.location && <span>📍 {r.location}</span>}
                  </div>
                )}
              </div>
              <button onClick={() => deleteReview(r.id)} className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center hover:bg-red-500/20 shrink-0">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function ReviewsCmsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editReview, setEditReview] = useState(null);
  const [form, setForm] = useState(emptyReviewForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/api/reviews').then(res => { setReviews(res.data); setLoading(false); });
  }, []);

  const resetForm = () => {
    setShowForm(false);
    setEditReview(null);
    setForm(emptyReviewForm);
  };

  const startEdit = (review) => {
    setEditReview(review);
    setForm({
      ...emptyReviewForm,
      ...review,
      name: review.name || review.customer_name || '',
      customer_name: review.customer_name || review.name || '',
      comment: review.comment || review.review_text || '',
      review_text: review.review_text || review.comment || ''
    });
    setShowForm(true);
  };

  const saveReview = async () => {
    const payload = {
      ...form,
      name: form.name || form.customer_name,
      customer_name: form.customer_name || form.name,
      comment: form.comment || form.review_text,
      review_text: form.review_text || form.comment
    };

    if (editReview) {
      const res = await api.put(`/api/reviews/${editReview.id}`, payload);
      setReviews(prev => prev.map(r => r.id === editReview.id ? res.data : r));
      toast.success('Review updated.');
    } else {
      const res = await api.post('/api/admin/reviews', payload);
      setReviews(prev => [res.data, ...prev]);
      toast.success('Review added.');
    }
    resetForm();
  };

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    await api.delete(`/api/reviews/${id}`);
    setReviews(prev => prev.filter(r => r.id !== id));
    toast.success('Review deleted.');
  };

  const updateReviewStatus = async (review, status) => {
    const res = await api.put(`/api/reviews/${review.id}`, {
      ...review,
      status,
      active: status === 'approved'
    });
    setReviews(prev => prev.map(r => r.id === review.id ? res.data : r));
    toast.success(status === 'approved' ? 'Review approved.' : 'Review rejected.');
  };

  const uploadPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadAdminFile(file, { linked_type: 'review', linked_id: editReview?.id });
      setForm(prev => ({ ...prev, photo_url: uploaded.secure_url || uploaded.url }));
      toast.success('Photo uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-heading">Reviews</h2>
        <Button onClick={() => { setShowForm(true); setEditReview(null); setForm(emptyReviewForm); }} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Review
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white">{editReview ? 'Edit Review' : 'New Review'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Customer name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value, customer_name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input type="number" min="1" max="5" placeholder="Rating 1-5" value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Service/category" value={form.service_category} onChange={e => setForm({ ...form, service_category: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Photo URL" value={form.photo_url || ''} onChange={e => setForm({ ...form, photo_url: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value, active: e.target.value === 'approved' })} className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white">
              <option value="pending" className="bg-[#0A0E1A]">Pending</option>
              <option value="approved" className="bg-[#0A0E1A]">Approved</option>
              <option value="rejected" className="bg-[#0A0E1A]">Rejected</option>
            </select>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5">
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadPhoto(e.target.files?.[0])} disabled={uploading} />
            </label>
          </div>
          <textarea placeholder="Review text" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value, review_text: e.target.value })} className="w-full glass rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 border border-white/5 focus:outline-none bg-transparent min-h-[90px]" />
          {form.photo_url && <img src={form.photo_url} alt="Review customer" className="h-20 w-20 rounded-xl object-cover" />}
          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
              Feature on homepage
            </label>
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} />
              Active
            </label>
          </div>
          <div className="flex gap-3">
            <Button onClick={saveReview} disabled={!form.name || !form.comment} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">Save</Button>
            <Button variant="outline" onClick={resetForm} className="border-white/10 text-white/60 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? <div className="glass rounded-xl p-5 h-20 animate-pulse" />
      : reviews.length === 0 ? <div className="glass rounded-2xl p-12 text-center"><p className="text-white/40">No reviews yet.</p></div>
      : <div className="space-y-3">
          {reviews.map(review => (
            <div key={review.id} className="glass rounded-xl p-4 flex items-start gap-4">
              {review.photo_url && <img src={review.photo_url} alt={review.name || review.customer_name} className="h-12 w-12 rounded-xl object-cover" />}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold text-white">{review.name || review.customer_name}</h3>
                  <span className="text-xs text-yellow-400">{'★'.repeat(review.rating || 5)}</span>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${
                    review.status === 'approved'
                      ? 'border-green-500/20 bg-green-500/10 text-green-300'
                      : review.status === 'rejected'
                        ? 'border-red-500/20 bg-red-500/10 text-red-300'
                        : 'border-yellow-500/20 bg-yellow-500/10 text-yellow-300'
                  }`}>{review.status || 'pending'}</span>
                  {review.active === false && <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-0.5 text-[10px] text-red-300">Hidden</span>}
                </div>
                <p className="mt-1 text-xs text-white/45">{review.comment || review.review_text}</p>
                <p className="mt-1 text-[10px] text-white/30">{[review.service_category, review.location].filter(Boolean).join(' - ')}</p>
              </div>
              <button onClick={() => startEdit(review)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-blue-400"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => updateReviewStatus(review, 'approved')} className="rounded-lg bg-green-500/10 px-3 py-2 text-xs font-semibold text-green-300 hover:bg-green-500/20">Approve</button>
              <button onClick={() => updateReviewStatus(review, 'rejected')} className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/20">Reject</button>
              <button onClick={() => deleteReview(review.id)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>}
    </div>
  );
}

function openBookingDirections(booking) {
  if (booking.latitude && booking.longitude) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${booking.latitude},${booking.longitude}`, '_blank', 'noopener,noreferrer');
    return;
  }

  if (booking.address) {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}`, '_blank', 'noopener,noreferrer');
  }
}

function WhatsAppConnectionPanel() {
  return (
    <div className="glass rounded-2xl p-6 mb-8 border border-amber-400/15 bg-amber-400/[0.03]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-300" />
            WhatsApp Automation
          </h3>
          <p className="mt-1 text-xs text-white/40">
            Status: <span className="text-amber-300">Paused temporarily</span>
          </p>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-white/45">
            Customer WhatsApp opt-in is still stored with every booking for future use. Automatic WhatsApp Web messages and QR login are disabled on the live backend for reliability.
          </p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold text-white/60">
          Bookings still save normally
        </div>
      </div>
    </div>
  );
}

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState(null);
  const [form, setForm] = useState(emptyServiceForm);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    api.get('/api/services').then(res => { setServices(res.data); setLoading(false); });
  }, []);

  const resetForm = () => {
    setForm(emptyServiceForm);
    setEditService(null);
    setShowForm(false);
  };

  const saveService = async () => {
    const payload = {
      ...form,
      status: form.active ? 'active' : 'inactive'
    };
    if (editService) {
      const res = await api.put(`/api/services/${editService.id}`, payload);
      setServices(prev => prev.map(s => s.id === editService.id ? res.data : s));
      toast.success('Service updated.');
    } else {
      const res = await api.post('/api/services', payload);
      setServices(prev => [res.data, ...prev]);
      toast.success('Service added.');
    }
    resetForm();
  };

  const deleteService = async (id) => {
    if (!window.confirm('Delete this service?')) return;
    await api.delete(`/api/services/${id}`);
    setServices(prev => prev.filter(s => s.id !== id));
    toast.success('Service deleted.');
  };

  const uploadServiceImage = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadAdminFile(file, { linked_type: 'service', linked_id: editService?.id });
      setForm(prev => ({ ...prev, image_url: uploaded.secure_url || uploaded.url }));
      toast.success('Service image uploaded.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white font-heading">Services</h2>
        <Button onClick={() => { setShowForm(true); setEditService(null); setForm(emptyServiceForm); }} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {showForm && (
        <div className="glass rounded-2xl p-5 space-y-4">
          <Input placeholder="Service name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <Input placeholder="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <Input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input placeholder="Approx price" value={form.approx_price || ''} onChange={e => setForm({ ...form, approx_price: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Icon name" value={form.icon || ''} onChange={e => setForm({ ...form, icon: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <Input placeholder="Image URL" value={form.image_url || ''} onChange={e => setForm({ ...form, image_url: e.target.value })} className="bg-white/5 border-white/10 text-white" />
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5">
              <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Image'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadServiceImage(e.target.files?.[0])} disabled={uploading} />
            </label>
          </div>
          {form.image_url && <img src={form.image_url} alt="Service preview" className="h-24 w-32 rounded-xl object-cover" />}
          <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked, status: e.target.checked ? 'active' : 'inactive' })} />
            Active service
          </label>
          <div className="flex gap-2">
            <Button onClick={saveService} className="bg-green-600 hover:bg-green-500 text-white rounded-xl">Save</Button>
            <Button onClick={resetForm} variant="outline" className="border-white/10 text-white/60 rounded-xl">Cancel</Button>
          </div>
        </div>
      )}

      {loading ? <div className="glass rounded-xl p-5 h-20 animate-pulse" />
      : services.length === 0 ? <div className="glass rounded-2xl p-12 text-center"><p className="text-white/40">No services yet.</p></div>
      : <div className="space-y-3">
          {services.map(service => (
            <div key={service.id} className="glass rounded-xl p-4 flex items-center gap-4">
              {service.image_url ? (
                <img src={service.image_url} alt={service.name} className="h-14 w-16 rounded-xl object-cover" />
              ) : (
                <div className="h-14 w-16 rounded-xl bg-white/5 flex items-center justify-center"><Wrench className="w-5 h-5 text-white/30" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white">{service.name}</h3>
                <p className="text-xs text-blue-400">{service.category}</p>
                <p className="text-xs text-white/40 truncate">{service.description}</p>
                {service.approx_price && <p className="text-xs text-amber-300 mt-1">{service.approx_price}</p>}
              </div>
              <span className={`text-xs ${(service.active ?? service.status !== 'inactive') ? 'text-green-400' : 'text-red-300'}`}>{(service.active ?? service.status !== 'inactive') ? 'Active' : 'Inactive'}</span>
              <button onClick={() => { setEditService(service); setForm({ ...emptyServiceForm, ...service, active: service.active ?? service.status !== 'inactive' }); setShowForm(true); }} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-blue-400">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => deleteService(service.id)} className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>}
    </div>
  );
}

function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/admin/users').then(res => { setUsers(res.data); setLoading(false); });
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold text-white font-heading mb-6">User Management</h2>
      {loading ? <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="glass rounded-xl p-4 animate-pulse h-14" />)}</div>
      : <div className="space-y-2">
          {users.map(u => (
            <div key={u.id} className="glass rounded-xl p-4 flex items-center gap-4">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center text-sm font-bold text-blue-400 shrink-0">
                {u.name?.charAt(0) || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{u.name || 'No Name'}</p>
                  <span className="text-[10px] text-white/30">• {u.city}</span>
                </div>
                <p className="text-xs text-white/40 truncate">{u.mobile_number}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-blue-400 bg-blue-500/5 px-2.5 py-1 rounded-xl border border-blue-500/10 font-semibold">{u.booking_count || 0} Bookings</span>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${u.role === 'admin' ? 'text-purple-400 bg-purple-500/10 border-purple-500/20' : 'text-white/40 bg-white/5 border-white/10'}`}>{u.role}</span>
              </div>
            </div>
          ))}
        </div>
      }
    </div>
  );
}

function SettingsPage() {
  const SETTINGS = [
    { label: 'Primary WhatsApp', value: '+91 8688074469' },
    { label: 'Secondary WhatsApp', value: '+91 9398158902' },
    { label: 'Email', value: 'mahathicontractors@gmail.com' },
    { label: 'Website', value: 'mahathicontractors.in' },
    { label: 'Owner', value: 'Simhadri Sampath Kumar' },
    { label: 'Office', value: 'Vijayawada, AP, India' },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold text-white font-heading mb-6">Settings & Info</h2>
      <div className="glass rounded-2xl p-6 space-y-4">
        {SETTINGS.map(s => (
          <div key={s.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
            <span className="text-sm text-white/50">{s.label}</span>
            <span className="text-sm text-white font-medium">{s.value}</span>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6 mt-4">
        <h3 className="text-sm font-semibold text-white mb-3">WhatsApp Notification Status</h3>
        <p className="text-xs text-white/40 leading-relaxed">WhatsApp opt-in is saved with bookings for future use. Automatic WhatsApp Web messages are temporarily paused for reliability.</p>
      </div>
    </div>
  );
}

function DashboardHome({ bookings, stats }) {
  const total = bookings.length;
  const pending = bookings.filter(b => b.status === 'pending').length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const totalUsers = stats.totalUsers || 0;

  return (
    <div>
      <h2 className="text-xl font-bold text-white font-heading mb-6">Overview</h2>
      <WhatsAppConnectionPanel />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: total, color: 'text-blue-400', bg: 'bg-blue-500/10', icon: ClipboardList },
          { label: 'Pending Bookings', value: pending, color: 'text-yellow-400', bg: 'bg-yellow-500/10', icon: Clock },
          { label: 'Total Users', value: totalUsers, color: 'text-cyan-400', bg: 'bg-cyan-500/10', icon: Users },
          { label: 'Completed Bookings', value: completed, color: 'text-green-400', bg: 'bg-green-500/10', icon: CheckCircle2 },
        ].map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-5">
            <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-xs text-white/40 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Bookings</h3>
          {bookings.slice(0, 5).map(b => {
            const cfg = statusConfig[b.status] || statusConfig.pending;
            return (
              <div key={b.id} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{b.contact_name || 'Unknown'}</p>
                  <p className="text-xs text-white/40 truncate">{b.service_name}</p>
                </div>
                <span className={`text-[11px] px-2 py-0.5 rounded-full border shrink-0 ${cfg.color} ${cfg.bg}`}>{cfg.label}</span>
              </div>
            );
          })}
          {bookings.length === 0 && <p className="text-sm text-white/30 text-center py-4">No bookings yet.</p>}
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Recent Users</h3>
          {stats.recentLogins && stats.recentLogins.length > 0 ? (
            stats.recentLogins.slice(0, 5).map((login, idx) => (
              <div key={idx} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-400 bg-blue-500/10 w-6 h-6 rounded-lg flex items-center justify-center font-bold">✓</span>
                  <p className="text-sm text-white font-medium">{login.name || login.mobile_number}</p>
                </div>
                <span className="text-xs text-white/30">
                  {format(new Date(login.created_at), 'dd MMM hh:mm a')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-white/30 text-center py-4">No recent users.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main Admin Dashboard ---
const sidebarItems = [
  { id: 'home', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: ClipboardList },
  { id: 'leads', label: 'Leads', icon: Mail },
  { id: 'projects', label: 'Projects', icon: FolderKanban },
  { id: 'services', label: 'Services', icon: Wrench },
  { id: 'reviews', label: 'Reviews', icon: Star },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function AdminDashboard() {
  const { user, logout, isLoadingAuth } = useAuth();
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, bookings: [], recentLogins: [] });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (user?.role === 'admin') {
        try {
          const statsRes = await api.get('/api/admin/stats');
          setStats(statsRes.data);
          const bookingsRes = await api.get('/api/bookings');
          setBookings(bookingsRes.data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingStats(false);
        }
      } else {
        setLoadingStats(false);
      }
    };
    if (user) {
      init();
    }
  }, [user]);

  if (isLoadingAuth || loadingStats) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0A0E1A]">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[#0A0E1A]">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-2">Admin Access Only</h1>
        <p className="text-white/40 text-sm mb-6">You don't have permission to access this page.</p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-500 transition-colors">Go Home</a>
      </div>
    );
  }

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <DashboardHome bookings={bookings} stats={stats} />;
      case 'bookings': return <BookingsPage />;
      case 'leads': return <LeadsPage />;
      case 'projects': return <ProjectsPage />;
      case 'services': return <ServicesPage />;
      case 'reviews': return <ReviewsCmsPage />;
      case 'users': return <UsersPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardHome bookings={bookings} stats={stats} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E1A] flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 glass border-r border-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5">
          <div>
            <p className="text-base font-bold text-white font-heading">MBC Admin</p>
            <p className="text-[10px] text-blue-400/70 -mt-1 tracking-widest uppercase">MBC App</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activePage === item.id
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-white truncate">{user.name || 'Admin'}</p>
            <p className="text-[10px] text-white/30 truncate">{user.mobile_number}</p>
          </div>
          <a href="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <Eye className="w-4 h-4" /> View Website
          </a>
          <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="glass border-b border-white/5 px-4 lg:px-8 py-4 flex items-center gap-4 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-white/60 hover:text-white">
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-white flex-1 capitalize">
            {sidebarItems.find(i => i.id === activePage)?.label || 'Dashboard'}
          </h1>
          <span className="text-xs text-white/30">Admin Panel</span>
        </header>

        {/* Page */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
