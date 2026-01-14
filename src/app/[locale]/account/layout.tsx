import { AccountSidebar } from "@/components/layout/AccountSidebar";
import { prisma } from "@/lib/db";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export default async function AccountLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    let favoritesCount = 0;
    if (user) {
        try {
            favoritesCount = await prisma.favorite.count({
                where: { userId: user.id }
            });
        } catch (error) {
            console.error("[ACCOUNT LAYOUT] Failed to fetch favorites count:", error);
            // Fail silently -> favorites count = 0
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="md:col-span-3 lg:col-span-2 xl:col-span-2">
                        <div className="sticky top-24">
                            <AccountSidebar favoritesCount={favoritesCount} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-9 lg:col-span-10 xl:col-span-10">
                        <div className="max-w-5xl">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
