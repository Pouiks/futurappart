import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Assuming this exists
import { DossierEngine } from '@/core/dossier/engine';

const engine = new DossierEngine();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        // 1. Create/Update Person
        if (action === 'UPSERT_PERSON') {
            const { id, profileId, ...data } = payload;
            // Validate input with Zod here

            const person = await prisma.dossierPerson.upsert({
                where: { id: id || 'new' }, // UUID generation handled by DB if new? careful with client generation.
                create: { ...data, profileId },
                update: { ...data }
            });

            // Re-evaluate requirements immediately
            const requirements = engine.getRequirements({
                role: person.role,
                status: person.status,
                nationality: person.nationality,
                isMinor: person.isMinor,
                guarantorType: person.guarantorType
            });

            return NextResponse.json({ person, requirements });
        }

        // 2. Upload Request (Signed URL)
        if (action === 'GET_UPLOAD_URL') {
            const { personId, docType, filename, mimeType } = payload;
            // Check RLS or ownership here (done via Supabase Auth usually, but here API acts as signer)
            // Generate Supabase Storage Signed URL
            // const { data, error } = await supabase.storage.from('secure-documents').createSignedUrl(...)

            return NextResponse.json({ url: 'https://fake-signed-url.com/...' });
        }

        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });

    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    // Fetch full dossier for current user
    // const userId = ... (from session)
    return NextResponse.json({ message: "Not implemented shell" });
}
