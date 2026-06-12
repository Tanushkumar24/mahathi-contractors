import React, { useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Clock, Hammer, IndianRupee, MapPin, ShieldCheck } from 'lucide-react';
import SEO, { buildDefaultSchema } from '@/components/SEO';
import {
  BRAND_SHORT,
  BUSINESS_EMAIL,
  BUSINESS_NAME,
  BUSINESS_PHONE,
  SITE_URL,
  buildServiceLocationDescription,
  buildServiceLocationPath,
  buildServiceLocationTitle,
  findSeoLocation,
  findSeoService,
  seoLocations,
  seoServices,
} from '@/lib/seoData';
import { Button } from '@/components/ui/button';

const trustItems = [
  { icon: Clock, title: 'Founded in 2020', text: 'Local construction service built around accountability and practical site execution.' },
  { icon: Hammer, title: '20+ Years Founder Experience', text: 'Hands-on experience across civil works, renovations, interiors, and project management.' },
  { icon: ShieldCheck, title: 'Quality Materials', text: 'Material choices are discussed clearly before work starts.' },
  { icon: IndianRupee, title: 'Transparent Pricing', text: 'Clear estimates, scope clarity, and no confusing shortcuts.' },
];

function buildSchema(service, location, canonical) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      buildDefaultSchema(canonical),
      {
        '@type': 'Service',
        name: `${service.label} in ${location.name}`,
        serviceType: service.label,
        provider: {
          '@type': 'LocalBusiness',
          name: BUSINESS_NAME,
          telephone: BUSINESS_PHONE,
          email: BUSINESS_EMAIL,
        },
        areaServed: {
          '@type': 'City',
          name: location.name,
        },
        url: canonical,
        description: buildServiceLocationDescription(service, location),
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Do you provide ${service.label.toLowerCase()} in ${location.name}?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `Yes. ${BUSINESS_NAME} handles ${service.label.toLowerCase()} in ${location.name} and nearby areas with site assessment, clear scope, and professional execution.`,
            },
          },
          {
            '@type': 'Question',
            name: 'Can I request vastu-friendly planning?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. We respect family preferences, site direction, pooja room placement, ventilation, and practical daily-use planning.',
            },
          },
        ],
      },
    ],
  };
}

export default function ServiceLocation() {
  const { service: serviceSlug, location: locationSlug } = useParams();
  const service = findSeoService(serviceSlug);
  const location = findSeoLocation(locationSlug);

  if (!service || !location) {
    return <Navigate to="/services" replace />;
  }

  const canonical = `${SITE_URL}${buildServiceLocationPath(service.slug, location.slug)}`;
  const title = buildServiceLocationTitle(service, location);
  const description = buildServiceLocationDescription(service, location);

  const nearbyLinks = useMemo(() => {
    const nearbySlugs = location.nearby
      .map((name) => seoLocations.find((item) => item.name === name))
      .filter(Boolean);
    return nearbySlugs.slice(0, 4);
  }, [location]);

  const relatedServices = seoServices.filter((item) => item.slug !== service.slug).slice(0, 5);

  return (
    <div className="pt-24">
      <SEO title={title} description={description} canonical={canonical} schema={buildSchema(service, location, canonical)} />

      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-slate-950/20 to-blue-950/20 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-amber-200">
                <MapPin className="h-3.5 w-3.5" /> {location.name}, {location.region}
              </p>
              <h1 className="font-heading text-4xl font-extrabold leading-tight text-white md:text-6xl">
                {service.titlePrefix} in <span className="text-gradient">{location.name}</span>
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/55">
                {BUSINESS_NAME} provides {service.description} in {location.name} and nearby Andhra Pradesh regions. Our work is planned for families, builders, shop owners, and property managers who need reliable execution without unnecessary confusion.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/book">
                  <Button className="h-12 rounded-xl bg-blue-600 px-6 font-semibold text-white hover:bg-blue-500">
                    Book Site Visit <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="h-12 rounded-xl border-white/10 text-white/75 hover:bg-white/5 hover:text-white">
                    Get Estimate
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55 }} className="glass rounded-2xl p-6">
              <h2 className="font-heading text-xl font-bold text-white">Why local customers choose {BRAND_SHORT}</h2>
              <div className="mt-5 space-y-4">
                {['Site visit and requirement discussion', 'Clear scope for materials and labour', 'Vastu-friendly and practical home planning', 'Residential, commercial, renovation, and maintenance support'].map((item) => (
                  <div key={item} className="flex gap-3 text-sm text-white/65">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/5 py-16">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {trustItems.map((item, index) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.05 }} className="glass rounded-2xl p-5">
              <item.icon className="mb-4 h-6 w-6 text-amber-300" />
              <h3 className="font-heading text-base font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="font-heading text-2xl font-bold text-white">{service.label} service details</h2>
              <p className="mt-4 text-sm leading-7 text-white/50">
                Every project starts with understanding the site, budget, family requirements, and expected timeline. For {service.label.toLowerCase()} in {location.name}, we focus on durable execution, transparent pricing, clean coordination, and practical design choices that suit Andhra Pradesh homes and commercial spaces.
              </p>
              <p className="mt-4 text-sm leading-7 text-white/50">
                We can also coordinate related works such as painting, plumbing, electrical repairs, interiors, waterproofing, maintenance, and civil works when the project requires multiple teams.
              </p>
            </div>

            <div className="glass rounded-2xl p-6 md:p-8">
              <h2 className="font-heading text-2xl font-bold text-white">FAQs</h2>
              <div className="mt-5 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Do you work near {location.name}?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">Yes. We serve {location.name} and nearby areas including {location.nearby.join(', ')}.</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Do you handle both small and large projects?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">Yes. We support new construction, renovation, interiors, repairs, painting, plumbing, electrical, waterproofing, and maintenance work.</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Can you plan homes with vastu preferences?</h3>
                  <p className="mt-2 text-sm leading-6 text-white/45">Yes. We keep vastu-friendly planning practical, with attention to site direction, ventilation, pooja room placement, and daily use.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 font-heading text-xl font-bold text-white">Nearby service areas</h2>
              <div className="flex flex-wrap gap-2">
                {nearbyLinks.map((nearby) => (
                  <Link key={nearby.slug} to={buildServiceLocationPath(service.slug, nearby.slug)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:border-blue-400/30 hover:text-white">
                    {service.label} in {nearby.name}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h2 className="mb-4 font-heading text-xl font-bold text-white">Related services</h2>
              <div className="flex flex-wrap gap-2">
                {relatedServices.map((related) => (
                  <Link key={related.slug} to={buildServiceLocationPath(related.slug, location.slug)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60 transition hover:border-blue-400/30 hover:text-white">
                    {related.label} in {location.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
