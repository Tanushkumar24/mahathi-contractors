import React from 'react';
import HeroSection from '../components/home/HeroSection';
import StatsSection from '../components/home/StatsSection';
import MarqueeBanner from '../components/home/MarqueeBanner';
import FeaturedServices from '../components/home/FeaturedServices';
import BeforeAfterSection from '../components/home/BeforeAfterSection';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <StatsSection />
      <MarqueeBanner />
      <FeaturedServices />
      <BeforeAfterSection />
      <ReviewsCarousel />
      <CTASection />
    </div>
  );
}