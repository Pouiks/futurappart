import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import DossierBuilder from '@/components/features/dossier/DossierBuilder';

async function getDossierData() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    // We are in a Server Component, we can't set cookies here but usually safe for GET
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Fetch Profile + Dossier Persons
    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: {
            dossierPersons: {
                include: {
                    documents: true
                }
            }
        }
    });

    return { user, profile };
}

export default async function DossierPage() {
    const data = await getDossierData();

    if (!data || !data.user) {
        redirect('/'); // Or a login route
    }

    // If profile exists but no dossier person, maybe initialize Applicant?
    // We can leave that to the Builder or do it here.
    // For now, pass what we have.

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="container mx-auto px-4">
                <DossierBuilder
                    initialProfile={data.profile}
                    userId={data.user.id}
                />
            </div>
        </div>
    );
}
