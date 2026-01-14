
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkStorage() {
    console.log('Checking Storage Buckets...');

    const { data, error } = await supabaseAdmin.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
        return;
    }

    console.log('Buckets found:', data.map(b => b.name));

    const bucketName = 'secure-documents';
    const exists = data.find(b => b.name === bucketName);

    if (!exists) {
        console.log(`Bucket '${bucketName}' NOT FOUND. Attempting to create...`);
        const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
            public: false,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'application/pdf']
        });

        if (createError) {
            console.error('Failed to create bucket:', createError);
        } else {
            console.log(`Bucket '${bucketName}' created successfully.`);
        }
    } else {
        console.log(`Bucket '${bucketName}' exists.`);
    }
}

checkStorage();
