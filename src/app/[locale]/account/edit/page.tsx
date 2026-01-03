import { prisma } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProfileEditor from '@/components/features/ProfileEditor';
import { getTranslations } from 'next-intl/server';

export default async function EditProfilePage() {
    const t = await getTranslations('Profile');
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return cookieStore.getAll() },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/auth');
    }

    const profile = await prisma.profile.findUnique({
        where: { id: user.id },
        include: { guarantors: true } // Fetch guarantors
    });

    const defaultProfile = {
        firstName: '',
        lastName: '',
        phone: '',
        income: 0,
        cafNumber: '',
        arrivalDate: null,
        guarantors: []
    };

    const finalProfile = profile || defaultProfile;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">
                {profile ? t('editTitle') : t('createTitle')}
            </h1>
            <p className="text-gray-500">
                {t('description')}
            </p>

            <ProfileEditor profile={finalProfile} guarantors={finalProfile.guarantors} />
        </div>
    );
}
