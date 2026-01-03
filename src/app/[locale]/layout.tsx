import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MonLogementEtudiant - Comparateur de Logement Étudiant 2025",
  description: "Trouvez votre logement étudiant idéal à Lyon, Bordeaux, Paris... Comparez les résidences et trouvez la meilleure offre sans frais cachés.",
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

  if (user) {
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
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
