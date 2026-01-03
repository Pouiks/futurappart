import { prisma } from '@/lib/db';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
        case 'ACCEPTED':
            return <div className="flex items-center gap-1 text-green-700 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100"><CheckCircle className="w-3 h-3" /> Accepté</div>
        case 'REJECTED':
            return <div className="flex items-center gap-1 text-red-700 bg-red-50 px-3 py-1 rounded-full text-xs font-bold border border-red-100"><XCircle className="w-3 h-3" /> Refusé</div>
        case 'SENT':
            return <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-3 py-1 rounded-full text-xs font-bold border border-blue-100"><CheckCircle className="w-3 h-3" /> Envoyé</div>
        default:
            return <div className="flex items-center gap-1 text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100"><Clock className="w-3 h-3" /> En attente</div>
    }
}

export default async function ApplicationsPage() {
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

    const applications = await prisma.subscriptionRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    });

    // Fix for existing applications without residenceName:
    // Fetch related units manually since we don't have a direct relation in the schema for 'requests'
    const unitIds = applications.map(a => a.unitId);
    const units = await prisma.canonUnit.findMany({
        where: { id: { in: unitIds } },
        include: { residence: true }
    });

    const residenceMap = new Map(units.map(u => [u.id, u.residence.name]));

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-500" />
                Mes Candidatures
            </h1>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {applications.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">Vous n'avez envoyé aucune candidature.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {applications.map((app) => (
                            <div key={app.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">{app.residenceName || residenceMap.get(app.unitId) || 'Résidence inconnue'}</h3>
                                    <p className="text-sm text-gray-500">Dossier #{app.id.slice(0, 8)} • Envoyé le {new Date(app.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <StatusBadge status={app.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
