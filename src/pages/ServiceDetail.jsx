import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Phone, MessageCircle, Home, Ruler, Hammer, Wrench, Zap, Grid3X3, Paintbrush, Sofa, Droplets, Shield, Sun, Tv, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';
import GlassCard from '../components/shared/GlassCard';

const serviceData = {
  'house-construction': {
    name: 'House Construction',
    category: 'Construction',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80',
    description: 'We build premium residential homes tailored to your dreams. From single-floor homes to multi-story residences, our expert team ensures every brick is laid with precision and care.',
    included: ['Site inspection & soil testing', 'Foundation & RCC work', 'Brick masonry & plastering', 'Roofing & waterproofing', 'Electrical & plumbing', 'Flooring & tile work', 'Painting & finishing', 'Final handover with documentation'],
    process: ['Free consultation & site visit', 'Architectural planning & 3D design', 'Material selection & quotation', 'Construction begins with milestone tracking', 'Quality inspection at every stage', 'Final finishing & handover'],
    related: ['interior-design', 'architecture-planning', 'terrace-waterproofing'],
  },
  'duplex-construction': {
    name: 'Duplex Construction',
    category: 'Construction',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    description: 'Elegant duplex homes that maximize vertical living space. Our team designs and builds duplex homes with thoughtful layouts, premium materials, and smart space planning.',
    included: ['Structural planning & dual-floor design', 'Staircase design & execution', 'Separate entry or shared entry options', 'Full electrical & plumbing for both floors', 'Premium finishes throughout', 'Final handover with warranty'],
    process: ['Site assessment & feasibility', '2D & 3D duplex floor plan', 'Material selection', 'Construction with stage tracking', 'Quality checks per floor', 'Handover'],
    related: ['house-construction', 'interior-design', 'villa-construction'],
  },
  'villa-construction': {
    name: 'Villa Construction',
    category: 'Construction',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    description: 'Luxury villa construction with world-class amenities, architectural excellence, and premium craftsmanship. Your personalized paradise built to last generations.',
    included: ['Luxury architectural design', 'Premium material sourcing', 'Landscaping & outdoor planning', 'Swimming pool provision', 'Smart home integration ready', 'Complete interior coordination'],
    process: ['Luxury consultation & vision mapping', 'Architect & design finalization', 'Premium material procurement', 'Phased construction with milestones', 'Interior coordination', 'Grand handover'],
    related: ['house-construction', 'interior-design', 'smart-wiring'],
  },
  'commercial-buildings': {
    name: 'Commercial Buildings',
    category: 'Construction',
    icon: Home,
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80',
    description: 'Commercial spaces designed for functionality, modern aesthetics, and durability. Offices, showrooms, warehouses — we build for business.',
    included: ['Commercial structural design', 'Fire safety & compliance', 'Heavy-duty flooring', 'Commercial electrical setup', 'HVAC provision', 'Parking & access planning'],
    process: ['Business requirements analysis', 'Architectural & structural design', 'Permit & approval assistance', 'Construction with safety protocols', 'Final inspection & handover'],
    related: ['smart-wiring', 'cctv-installation', 'tile-flooring'],
  },
  'interior-design': {
    name: 'Interior Design',
    category: 'Design & Planning',
    icon: Ruler,
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80',
    description: 'Transform your space into a masterpiece. Our interior design team creates stunning, functional spaces that reflect your personality and lifestyle.',
    included: ['3D visualization & walkthroughs', 'Space planning & layout', 'Material & color consultation', 'Modular furniture design', 'Lighting design', 'False ceiling & partition work', 'Final styling & decor'],
    process: ['Initial discussion & style assessment', '3D concept design presentation', 'Material & product selection', 'Execution & installation', 'Quality check & styling', 'Handover'],
    related: ['modular-kitchen', 'false-ceiling', 'wardrobes'],
  },
  'architecture-planning': {
    name: 'Architecture Planning',
    category: 'Design & Planning',
    icon: Ruler,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1200&q=80',
    description: 'Precision 2D/3D floor plans, elevation designs, and structural planning. A solid plan is the foundation of every great build.',
    included: ['Site analysis & orientation study', '2D floor plan drawing', '3D elevation design', 'Structural drawings', 'Permit & approval drawings', 'Vastu-compliant planning on request'],
    process: ['Site visit & measurement', 'Concept sketching', '2D drafting & approval', '3D elevation renders', 'Structural drawings', 'Final plan delivery'],
    related: ['house-construction', '3d-elevation', 'interior-design'],
  },
  '3d-elevation': {
    name: '3D Elevation',
    category: 'Design & Planning',
    icon: Ruler,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
    description: 'Photorealistic 3D elevation renders that show exactly how your home will look — before a single brick is laid.',
    included: ['Exterior 3D rendering', 'Multiple angle views', 'Material & color simulation', 'Day & night renders', 'Revision support', 'High-resolution image delivery'],
    process: ['Collect floor plan & preferences', '3D modeling', 'Texture & material application', 'Client review & revisions', 'Final render delivery'],
    related: ['architecture-planning', 'house-construction', 'interior-design'],
  },
  'excavation-foundation': {
    name: 'Excavation & Foundation',
    category: 'Civil Works',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80',
    description: 'Expert excavation and strong foundation work. The most critical stage of construction — done right the first time.',
    included: ['Soil bearing capacity test', 'Manual & machine excavation', 'PCC concrete bed', 'Footings & tie beams', 'Earth filling & compaction', 'Anti-termite treatment'],
    process: ['Site survey & marking', 'Excavation to required depth', 'PCC laying', 'Footing construction', 'Backfilling & leveling'],
    related: ['rcc-slab-casting', 'house-construction', 'brick-work-plastering'],
  },
  'rcc-slab-casting': {
    name: 'RCC & Slab Casting',
    category: 'Civil Works',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=1200&q=80',
    description: 'High-quality reinforced concrete work with precision engineering. Proper RCC ensures structural integrity for decades.',
    included: ['Steel reinforcement as per design', 'Shuttering & formwork', 'Concrete mix with M20/M25 grade', 'Vibration & curing process', 'Column, beam & slab casting', 'Quality test certificates'],
    process: ['Structural design review', 'Reinforcement binding', 'Shuttering setup', 'Concrete pouring & vibration', 'Curing for 28 days'],
    related: ['excavation-foundation', 'brick-work-plastering', 'house-construction'],
  },
  'brick-work-plastering': {
    name: 'Brick Work & Plastering',
    category: 'Civil Works',
    icon: Hammer,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80',
    description: 'Professional masonry and smooth plastering services. Precise brickwork and expert plastering form the backbone of your interior and exterior finish.',
    included: ['Grade A brick supply & laying', 'Internal & external plastering', 'Waterproof plaster for wet areas', 'Groove & band work', 'Smooth finish for painting', 'Quality inspection'],
    process: ['Layout & marking', 'Brick courses with plumb check', 'Internal wall plastering', 'External plastering', 'Curing & drying'],
    related: ['rcc-slab-casting', 'interior-painting', 'tile-flooring'],
  },
  'bathroom-plumbing': {
    name: 'Bathroom Plumbing',
    category: 'Plumbing',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80',
    description: 'Complete bathroom plumbing with premium fittings and fixtures. Leak-proof, durable plumbing with top brand fittings.',
    included: ['CPVC/UPVC pipe installation', 'Hot & cold water lines', 'WC, basin & shower fitting', 'Floor trap & drainage', 'Water pressure testing', 'Concealed or surface piping'],
    process: ['Plumbing layout design', 'Concealed pipe routing', 'Fixture installation', 'Pressure & leak testing', 'Final finishing & grouting'],
    related: ['kitchen-plumbing', 'bathroom-waterproofing', 'house-construction'],
  },
  'kitchen-plumbing': {
    name: 'Kitchen Plumbing',
    category: 'Plumbing',
    icon: Wrench,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    description: 'Kitchen plumbing solutions with modern fixtures and drainage. From water supply to waste disposal — complete kitchen plumbing.',
    included: ['Supply line installation', 'Sink & tap fitting', 'Under-counter drainage', 'Washing machine outlet', 'Purifier connection point', 'Drainage slope & trap'],
    process: ['Kitchen layout review', 'Supply & drain routing', 'Fixture installation', 'Pressure testing', 'Handover'],
    related: ['bathroom-plumbing', 'modular-kitchen', 'house-construction'],
  },
  'smart-wiring': {
    name: 'Smart Wiring',
    category: 'Electrical',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=1200&q=80',
    description: 'Complete home wiring with smart automation and safety systems. Future-proof your home with modern electrical infrastructure.',
    included: ['ISI-certified copper wiring', 'MCB & ELCB circuit protection', 'Modular switches & sockets', 'Smart switch provision', 'Earthing system', 'Load calculation & panel design'],
    process: ['Electrical layout planning', 'Conduit pipe routing', 'Wiring & termination', 'DB installation', 'Testing & commissioning'],
    related: ['solar-installation', 'cctv-installation', 'smart-locks'],
  },
  'solar-installation': {
    name: 'Solar Installation',
    category: 'Electrical',
    icon: Sun,
    image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1200&q=80',
    description: 'Solar panel setup with net metering for sustainable energy. Reduce electricity bills and go green with premium solar systems.',
    included: ['Site solar assessment', 'Premium solar panels supply', 'Inverter & battery setup', 'Net metering application support', 'Mounting structure installation', '5-year maintenance warranty'],
    process: ['Energy audit & sizing', 'Panel & inverter selection', 'Structural mounting', 'Wiring & grid connection', 'Net meter application', 'Handover & monitoring setup'],
    related: ['smart-wiring', 'ev-charger', 'house-construction'],
  },
  'cctv-installation': {
    name: 'CCTV Installation',
    category: 'Electrical',
    icon: Zap,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80',
    description: 'HD security camera systems with remote monitoring capability. Keep your home and premises secure 24/7.',
    included: ['Site security assessment', 'HD/4K camera supply', 'DVR/NVR setup', 'Night vision cameras', 'Remote mobile app access', 'Cable concealment & installation'],
    process: ['Security audit & camera placement plan', 'Cable routing & concealment', 'Camera & DVR installation', 'Mobile app configuration', 'Testing & handover'],
    related: ['smart-locks', 'smart-wiring', 'house-construction'],
  },
  'tile-flooring': {
    name: 'Tile Flooring',
    category: 'Flooring',
    icon: Grid3X3,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
    description: 'Premium tile flooring with expert installation and finishing. Beautiful, durable floors with perfect leveling and clean joints.',
    included: ['Floor surface preparation', 'Waterproofing bed for bathrooms', 'Tile supply & installation', 'Precision leveling', 'Grouting & joint filling', 'Edge profile & skirting'],
    process: ['Floor assessment & leveling', 'Tile layout marking', 'Bedding & adhesive application', 'Tile laying & grouting', 'Polishing & cleaning'],
    related: ['granite-marble', 'bathroom-waterproofing', 'house-construction'],
  },
  'granite-marble': {
    name: 'Granite & Marble',
    category: 'Flooring',
    icon: Grid3X3,
    image: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?w=1200&q=80',
    description: 'Luxury granite and marble flooring for elegant spaces. Premium natural stone with expert installation for timeless beauty.',
    included: ['Stone selection guidance', 'Premium stone supply', 'Expert cutting & fitting', 'Polishing & finishing', 'Staircase cladding', 'Threshold & skirting'],
    process: ['Stone selection & measurement', 'Surface preparation', 'Stone cutting & dry layout', 'Installation & grouting', 'Final polishing'],
    related: ['tile-flooring', 'interior-design', 'house-construction'],
  },
  'interior-painting': {
    name: 'Interior Painting',
    category: 'Painting',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&q=80',
    description: 'Professional interior painting using premium paints. Our skilled painters deliver flawless finishes that transform your home.',
    included: ['Wall surface preparation', 'Putty & primer application', '2 coats of premium paint', 'Clean masking & protection', 'Texture options available', 'Clean-up & restoration'],
    process: ['Color consultation & sampling', 'Surface preparation', 'Putty & primer coat', 'Final paint coats', 'Touch-up & quality check'],
    related: ['exterior-painting', 'texture-painting', 'interior-design'],
  },
  'exterior-painting': {
    name: 'Exterior Painting',
    category: 'Painting',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1200&q=80',
    description: 'Weather-resistant exterior painting for lasting beauty. Protect your home from rain, UV, and pollution with premium exterior coatings.',
    included: ['Wall crack filling & repair', 'Exterior primer coat', 'Weather-shield paint application', 'Two coats for coverage', 'Fascia & parapet painting', 'Scaffolding provision'],
    process: ['Surface inspection & repairs', 'Primer application', 'First coat', 'Final coat & touch-ups', 'Scaffold removal & cleaning'],
    related: ['interior-painting', 'terrace-waterproofing', 'house-construction'],
  },
  'texture-painting': {
    name: 'Texture Painting',
    category: 'Painting',
    icon: Paintbrush,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=80',
    description: 'Decorative texture painting with unique patterns and finishes. Add character and depth to your walls with premium texture designs.',
    included: ['Texture design consultation', 'Surface preparation', 'Base coat application', 'Texture pattern execution', 'Color glazing & finishing', 'Protective coating'],
    process: ['Design selection', 'Wall preparation', 'Base coat', 'Texture application', 'Color & glaze work', 'Sealing coat'],
    related: ['interior-painting', 'interior-design', 'false-ceiling'],
  },
  'modular-kitchen': {
    name: 'Modular Kitchen',
    category: 'Interiors',
    icon: Sofa,
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80',
    description: 'Create your dream kitchen with our custom modular solutions. Premium hardware, smart storage, and beautiful finishes.',
    included: ['Custom layout design', 'Premium cabinet modules', 'Soft-close hinges & channels', 'Granite or quartz countertop', 'Kitchen accessories & organizers', 'Professional installation'],
    process: ['Kitchen measurement & design', '3D visualization', 'Material & finish selection', 'Manufacturing', 'Installation & commissioning'],
    related: ['interior-design', 'wardrobes', 'false-ceiling'],
  },
  'wardrobes': {
    name: 'Wardrobes',
    category: 'Interiors',
    icon: Sofa,
    image: 'https://images.unsplash.com/photo-1558997519-83ea9252eeb8?w=1200&q=80',
    description: 'Built-in and walk-in wardrobes with smart storage solutions. Custom wardrobes designed to maximize your bedroom space.',
    included: ['Custom wardrobe design', 'Premium board material', 'Soft-close mechanisms', 'Internal drawer units', 'Mirror & glass panel options', 'Professional fitting'],
    process: ['Bedroom measurement', '3D wardrobe design', 'Material selection', 'Manufacturing', 'Installation & finishing'],
    related: ['modular-kitchen', 'interior-design', 'false-ceiling'],
  },
  'false-ceiling': {
    name: 'False Ceiling',
    category: 'Interiors',
    icon: Sofa,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&q=80',
    description: 'Designer false ceilings with ambient lighting integration. Elevate your interiors with stunning ceiling designs.',
    included: ['Gypsum / POP ceiling design', 'Recessed & cove lighting', 'Cornices & profile work', 'Fan provision points', 'AC duct concealment', 'Painting & finishing'],
    process: ['Design consultation', 'Structural frame installation', 'Board fixing', 'Lighting & duct integration', 'Painting & finishing'],
    related: ['interior-design', 'wardrobes', 'interior-painting'],
  },
  'terrace-waterproofing': {
    name: 'Terrace Waterproofing',
    category: 'Waterproofing',
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=1200&q=80',
    description: 'Stop leakage permanently. Our advanced waterproofing solutions protect your terrace from water seepage, ensuring a dry and safe home.',
    included: ['Surface preparation & cleaning', 'Crack filling & surface repair', 'Primer application', 'Waterproofing membrane coating', 'Protection screed', '10-year warranty on workmanship'],
    process: ['Site inspection & leak assessment', 'Surface preparation', 'Application of waterproofing system', 'Quality testing with water ponding', 'Final inspection & warranty certificate'],
    related: ['bathroom-waterproofing', 'house-construction', 'brick-work-plastering'],
  },
  'bathroom-waterproofing': {
    name: 'Bathroom Waterproofing',
    category: 'Waterproofing',
    icon: Droplets,
    image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&q=80',
    description: 'Bathroom waterproofing to prevent seepage and leakage. Protect walls and floors from moisture damage with advanced systems.',
    included: ['Surface crack repair', 'Waterproofing primer', 'Flexible membrane coating', 'Corner & joint sealing', 'Test ponding for 24 hours', 'Tile-ready surface'],
    process: ['Inspection & crack mapping', 'Surface preparation', 'Primer coat', 'Membrane application', 'Ponding test', 'Ready for tiling'],
    related: ['terrace-waterproofing', 'bathroom-plumbing', 'tile-flooring'],
  },
  'smart-locks': {
    name: 'Smart Locks',
    category: 'Smart Home',
    icon: Shield,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=1200&q=80',
    description: 'Upgrade your home security with smart digital locks. Control access via fingerprint, PIN, card, or mobile app.',
    included: ['Door compatibility assessment', 'Premium smart lock supply', 'Professional installation', 'App setup & configuration', 'User training', '1-year warranty'],
    process: ['Door assessment', 'Lock selection & recommendation', 'Installation', 'App pairing & testing', 'Handover & training'],
    related: ['cctv-installation', 'smart-wiring', 'home-theatre'],
  },
  'home-theatre': {
    name: 'Home Theatre',
    category: 'Smart Home',
    icon: Tv,
    image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&q=80',
    description: 'Custom home theatre setup with premium audio-visual systems. Bring the cinema experience into your home.',
    included: ['Room acoustic assessment', 'Projector or large display selection', 'Surround sound system', 'Acoustic panel installation', 'AV rack & control setup', 'Calibration & demo'],
    process: ['Room analysis', 'AV system design', 'Installation', 'Acoustic tuning', 'Calibration & handover'],
    related: ['smart-locks', 'smart-wiring', 'cctv-installation'],
  },
  'ev-charger': {
    name: 'EV Charger',
    category: 'Smart Home',
    icon: Car,
    image: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=1200&q=80',
    description: 'Electric vehicle charger installation for your home. Fast, safe, and smart EV charging right at your doorstep.',
    included: ['Load assessment & feasibility', 'Charger selection (7.4kW/11kW)', 'Dedicated circuit installation', 'Weather-proof enclosure', 'Safety breaker provision', 'Smart app connectivity'],
    process: ['Electrical load assessment', 'Charger selection', 'Wiring & circuit installation', 'Mounting & waterproofing', 'Testing & handover'],
    related: ['solar-installation', 'smart-wiring', 'smart-locks'],
  },
};

const allServicesList = Object.keys(serviceData).map(slug => ({
  slug,
  name: serviceData[slug].name,
  icon: serviceData[slug].icon,
}));

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = serviceData[slug];

  if (!service) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">🏗️</div>
        <h1 className="text-2xl font-bold text-white mb-2">Service Not Found</h1>
        <p className="text-white/40 mb-8">This service page is coming soon.</p>
        <Link to="/services">
          <Button className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl">
            View All Services
          </Button>
        </Link>
      </div>
    );
  }

  const Icon = service.icon;

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative h-72 md:h-96 overflow-hidden">
        <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0E1A] via-[#0A0E1A]/60 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <span className="inline-block text-xs font-semibold tracking-[0.2em] uppercase text-blue-400 mb-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20">
                {service.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-bold text-white font-heading">{service.name}</h1>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main */}
            <div className="lg:col-span-2 space-y-10">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h2 className="text-xl font-bold text-white font-heading mb-3">About This Service</h2>
                <p className="text-white/50 leading-relaxed text-base">{service.description}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
                <h2 className="text-xl font-bold text-white font-heading mb-4">What's Included</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.included.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 glass rounded-xl p-3">
                      <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-sm text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <h2 className="text-xl font-bold text-white font-heading mb-4">Our Process</h2>
                <div className="space-y-4">
                  {service.process.map((step, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 text-blue-400 text-sm font-bold">
                        {i + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-white/70 text-sm">{step}</p>
                        {i < service.process.length - 1 && (
                          <div className="w-px h-6 bg-blue-500/10 ml-[-22px] mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <GlassCard hover={false}>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white font-heading mb-2">Book This Service</h3>
                <p className="text-sm text-white/40 mb-5 leading-relaxed">
                  Our team will contact you to confirm details and provide a custom quote. No upfront payment required.
                </p>
                <Link to="/booking" className="block mb-3">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white border-0 rounded-xl h-12 font-semibold shadow-lg shadow-blue-500/25 gap-2">
                    Book Now — Free Consultation <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="https://wa.me/918688074469" target="_blank" rel="noopener noreferrer" className="block">
                  <Button variant="outline" className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5 rounded-xl h-11 gap-2">
                    <MessageCircle className="w-4 h-4 text-green-400" /> WhatsApp Us
                  </Button>
                </a>
              </GlassCard>

              {service.related?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">Related Services</h3>
                  <div className="space-y-2">
                    {service.related.map((rSlug) => {
                      const rel = allServicesList.find(s => s.slug === rSlug);
                      if (!rel) return null;
                      const RelIcon = rel.icon;
                      return (
                        <Link key={rSlug} to={`/services/${rSlug}`} className="flex items-center gap-3 glass glass-hover rounded-xl p-3 group">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                            <RelIcon className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm text-white/60 group-hover:text-white transition-colors">{rel.name}</span>
                          <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-blue-400 ml-auto transition-colors" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}