
import { createClient } from '@supabase/supabase-js';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUG STORAGE ---');

    // 1. Fetch last document
    const doc = await prisma.userDocument.findFirst({
        orderBy: { createdAt: 'desc' }
    });

    if (!doc) {
        console.error('No documents found in DB.');
        return;
    }

    console.log('Found document:', {
        id: doc.id,
        filename: doc.filename,
        storagePath: doc.storagePath,
        type: doc.type
    });

    // 2. Try with Service Role (Admin)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
        console.error('Missing Supabase env vars.');
        return;
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    console.log('Attempting to sign URL with Service Role...');
    const { data, error } = await supabase.storage
        .from('secure-documents')
        .createSignedUrl(doc.storagePath, 3600);

    if (error) {
        console.error('Error signing URL:', error);
    } else {
        console.log('Success! Signed URL:', data.signedUrl);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
