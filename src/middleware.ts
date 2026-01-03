import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

// 1. Initialize Intl Middleware
const intlMiddleware = createIntlMiddleware({
    locales: ['en', 'fr'],
    defaultLocale: 'fr'
});

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 2. Admin Route Protection (Supabase)
    if (pathname.startsWith('/admin')) {
        let response = NextResponse.next({
            request: {
                headers: request.headers,
            },
        });

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll();
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value }) =>
                            request.cookies.set(name, value)
                        );
                        response = NextResponse.next({
                            request: {
                                headers: request.headers,
                            },
                        });
                        cookiesToSet.forEach(({ name, value, options }) =>
                            response.cookies.set(name, value, options)
                        );
                    },
                },
            }
        );

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            // Redirect to login if not authenticated
            return NextResponse.redirect(new URL('/fr/auth?returnTo=' + pathname, request.url));
        }

        // [MVP Security] Check allowed email (Whitelist)
        // In production, use a 'role' column in profiles or public.admins table
        const allowedAdmins = ['virgile@monlogementetudiant.com', 'admin@example.com']; // Replace with user's email if known or env var
        if (user.email && !allowedAdmins.includes(user.email) && !user.email.endsWith('@monlogementetudiant.com')) {
            // Basic restriction: Allow specific emails or domain
            // return NextResponse.json({ error: 'Fobidden Access' }, { status: 403 });
            // Or redirect to home
            return NextResponse.redirect(new URL('/', request.url));
        }

        return response;
    }

    // 3. Public Routes (Intl)
    return intlMiddleware(request);
}

export const config = {
    // Matcher: Include admin routes AND i18n routes
    // Skip internal paths (_next, api, static assets)
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
