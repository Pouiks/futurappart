import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { unitId } = await request.json();
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (cookiesToSet) => { },
            },
        }
    );

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await prisma.favorite.create({
            data: {
                userId: user.id,
                unitId: unitId
            }
        });
        return NextResponse.json({ success: true });
    } catch (dbError) {
        // Unique constraint violation means already favorited, which is fine
        return NextResponse.json({ success: true });
    }
}
