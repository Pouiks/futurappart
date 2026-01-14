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
                    // We are in a Server Component
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

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

    console.log("DossierPage: Fetched Profile:", JSON.stringify(profile, null, 2));
    return { user, profile };
}

export default async function DossierPage() {
    const data = await getDossierData();

    if (!data || !data.user) {
        redirect('/');
    }

    return (
        <DossierBuilder
            initialProfile={data.profile}
            userId={data.user.id}
            user={data.user}
        />
    );
}
