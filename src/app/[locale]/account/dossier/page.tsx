import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getCachedUser } from '@/lib/auth-cache';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import DossierBuilder from '@/components/features/dossier/DossierBuilder';

async function getDossierData() {
    const user = await getCachedUser();
    if (!user) return null;

    try {
        // DIRECT DB FETCH - NO CACHE to debug persistence
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

        console.log("DossierPage: DIRECT DB FETCH (No Cache)");

        // Serialize to ensure Dates are strings (Fixes hydration issue)
        const serializedProfile = JSON.parse(JSON.stringify(profile));

        return { user, profile: serializedProfile };
    } catch (error) {
        console.error("DossierPage: DB Init Error, using fallback:", error);
        // Fallback for Demo Mode / DB Failure
        return {
            user,
            profile: {
                id: user.id,
                email: user.email,
                firstName: "Mode",
                lastName: "Démo",
                income: 0,
                status: 'STUDENT',
                dossierPersons: []
            }
        };
    }
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
