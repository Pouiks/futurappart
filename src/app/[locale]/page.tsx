import { HeroSection } from '@/components/landing/HeroSection';
import { SeoContent } from '@/components/landing/SeoContent';
import { FaqSection } from '@/components/landing/FaqSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { HousingAidSection } from '@/components/landing/HousingAidSection';
import { NoGuarantorSection } from '@/components/landing/NoGuarantorSection';
import { prisma } from '@/lib/db';

async function getAvailableCities() {
  const isDemo = process.env.DEMO_MODE === 'true';

  if (isDemo) {
    // Return hardcoded cities for demo mode
    return [
      { slug: 'paris', title: 'Paris' },
      { slug: 'lyon', title: 'Lyon' },
      { slug: 'toulouse', title: 'Toulouse' },
      { slug: 'bordeaux', title: 'Bordeaux' },
      { slug: 'lille', title: 'Lille' },
      { slug: 'nantes', title: 'Nantes' }
    ];
  }

  const cities = await prisma.canonResidence.findMany({
    select: {
      cityNormalized: true
    },
    distinct: ['cityNormalized'],
    orderBy: {
      cityNormalized: 'asc'
    }
  });

  return cities
    .map(c => c.cityNormalized)
    .filter(Boolean)
    .map(city => ({
      slug: city,
      title: city.charAt(0).toUpperCase() + city.slice(1).toLowerCase()
    }));
}

export default async function Home() {
  const cities = await getAvailableCities();

  // Rebuild Trigger 7 (Navbar Verification)
  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero with Overlay */}
      <HeroSection cities={cities} />

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
