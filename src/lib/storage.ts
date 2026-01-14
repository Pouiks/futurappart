
import { createClient } from '@supabase/supabase-js';

// Use Service Role Key to ensure we can sign URLs even if the user context is tricky in API routes
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

export async function getSignedDownloadUrl(path: string, expiresIn = 60 * 60 * 24 * 7): Promise<string | null> {
    try {
        const { data, error } = await supabaseAdmin
            .storage
            .from('secure-documents')
            .createSignedUrl(path, expiresIn);

        if (error) {
            console.error('[Storage] Error creating signed URL:', error);
            return null;
        }

        return data.signedUrl;
    } catch (e) {
        console.error('[Storage] Exception:', e);
        return null;
    }
}
