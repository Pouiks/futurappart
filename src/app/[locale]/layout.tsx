import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Futurappart - Trouvez votre logement",
  description: "Trouvez votre logement étudiant idéal à Lyon, Bordeaux, Paris... Comparez les résidences et trouvez la meilleure offre sans frais cachés.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' },
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' }
    ]
  }
};

import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/lib/db';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  // Fetch User & Counts Server-Side
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          // Layout write cookies? usually read-only but allowed in server components for auth check
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let counts = null;
  let alerts = null;

  const isDemo = process.env.DEMO_MODE === 'true';

  if (user && !isDemo) {
    try {
      const [favorites, applications, profile] = await Promise.all([
        prisma.favorite.count({ where: { userId: user.id } }),
        prisma.subscriptionRequest.count({ where: { userId: user.id } }),
        prisma.profile.findUnique({
          where: { id: user.id },
          include: { guarantors: true } // Fetch guarantors to check count
        })
      ]);

      // Check completion: Needs Income > 0 AND at least 1 Guarantor
      const isProfileComplete = !!(
        profile?.income &&
        profile.income > 0 &&
        profile.guarantors &&
        profile.guarantors.length > 0
      );

      counts = { favorites, applications };
      alerts = { incompleteProfile: !isProfileComplete };
    } catch (e) {
      console.error("[LAYOUT] Failed to fetch user data, likely DB connection issue. Falling back to safe mode.", e);
      // Fail silently to keep the app running in mock/degraded mode
    }
  }

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased min-h-screen flex flex-col pt-20" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <Navbar counts={counts} alerts={alerts} />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster richColors position="top-center" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
