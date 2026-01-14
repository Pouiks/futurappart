
import { createClient } from '@supabase/supabase-js';

// Lazy initialization to avoid build-time errors
let supabaseAdmin: ReturnType<typeof createClient> | null = null;

function getSupabaseAdmin() {
    if (!supabaseAdmin) {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            throw new Error('Supabase env vars not configured');
        }

        supabaseAdmin = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });
    }
    return supabaseAdmin;
}

export async function getSignedDownloadUrl(path: string, expiresIn = 60 * 60 * 24 * 7): Promise<string | null> {
    try {
        const { data, error } = await getSupabaseAdmin()
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
