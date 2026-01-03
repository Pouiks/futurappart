import { HeroSection } from '@/components/landing/HeroSection';
import { SeoContent } from '@/components/landing/SeoContent';
import { FaqSection } from '@/components/landing/FaqSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { HousingAidSection } from '@/components/landing/HousingAidSection';
import { NoGuarantorSection } from '@/components/landing/NoGuarantorSection';

export default function Home() {
  // Rebuild Trigger 7 (Navbar Verification)
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero with Overlay */}
      <HeroSection />

      {/* 2. SEO / Content */}
      <SeoContent />

      {/* 3. Steps (New) */}
      <HowItWorksSection />

      {/* 4. Housing Aid (New) */}
      <HousingAidSection />

      {/* 5. No Guarantor (v4 Visual Rhythm) */}
      <NoGuarantorSection />

      {/* 6. FAQ */}
      <FaqSection />
    </main>
  );
}
