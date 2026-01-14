import { prisma } from '@/lib/db';
import { Mail, Phone, MapPin, Calendar, Clock, Eye, FileText, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { DeleteRequestButton } from '@/components/admin/DeleteRequestButton';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
    const { id } = params;

    const profile = await prisma.profile.findUnique({
        where: { id },
        include: {
            guarantors: true,
            requests: {
                orderBy: { createdAt: 'desc' }
            },
            favorites: {
                include: { unit: { include: { residence: true } } }
            },
            _count: {
                select: { favorites: true, requests: true }
            }
        }
    });

    if (!profile) return <div>Utilisateur introuvable</div>;

    // Fetch Activity Stats (Tracking)
    const [viewEvents, totalViews] = await Promise.all([
        prisma.event.findMany({
            where: {
                userId: id, // Note: We need to ensure userId is linked in tracking
                eventType: { in: ['view_residence', 'access_residence'] }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        }),
        prisma.event.count({
            where: {
                userId: id,
                eventType: { in: ['view_residence', 'access_residence'] }
            }
        })
    ]);

    // We can enrich event data if needed by fetching residence names manually
    // But for MVP let's assume metadata contains name or we just show ID/City

    return (
        <div className="space-y-6 max-w-6xl mx-auto">

            {/* Header / Identity */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
                        {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">{profile.firstName} {profile.lastName}</h1>
                        <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email}</span>
                            <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {profile.phone || 'Non renseigné'}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="text-right">
                        <div className="text-xs uppercase font-bold text-slate-400">Statut</div>
                        <div className="font-bold text-slate-700">{profile.status || 'Nouveau'}</div>
                    </div>
                    <div className="w-px h-10 bg-slate-100"></div>
                    <div className="text-right">
                        <div className="text-xs uppercase font-bold text-slate-400">Arrivée prévue</div>
                        <div className="font-bold text-slate-700">{profile.arrivalDate ? profile.arrivalDate.toLocaleDateString() : '-'}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Dossier & Info */}
                <div className="space-y-6 md:col-span-2">

                    {/* Dossiers (Applications) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            Dossiers déposés ({profile._count.requests})
                        </h2>

                        <div className="space-y-3">
                            {profile.requests.length === 0 ? (
                                <p className="text-slate-400 text-sm italic">Aucun dossier déposé.</p>
                            ) : (
                                profile.requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <div className="font-bold text-slate-800">{req.residenceName || 'Résidence Inconnue'}</div>
                                            <div className="text-xs text-slate-500">Déposé le {req.createdAt.toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {req.status === 'SENT' && <span className="px-2 py-1 text-xs font-bold bg-green-100 text-green-700 rounded-full">Envoyé Partenaire</span>}
                                            {req.status === 'PENDING' && <span className="px-2 py-1 text-xs font-bold bg-amber-100 text-amber-700 rounded-full">En attente</span>}
                                            <DeleteRequestButton requestId={req.id} />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Guarantors */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <ShieldIcon className="w-5 h-5 text-indigo-600" />
                            Garants ({profile.guarantors.length})
                        </h2>
                        <div className="space-y-3">
                            {profile.guarantors.map(g => (
                                <div key={g.id} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-50">
                                    <div className="font-bold text-indigo-900">{g.firstName} {g.lastName}</div>
                                    <div className="text-xs text-indigo-600 uppercase font-bold">{g.relationship} • {g.situation}</div>
                                    <div className="text-sm mt-1 text-slate-600">Revenu: {g.income} €</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Tracking & Favorites */}
                <div className="space-y-6">

                    {/* Activity Feed (Tracking) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-lg flex items-center gap-2">
                                <Eye className="w-5 h-5 text-amber-600" />
                                Dernières Activités
                            </h2>
                            <div className="text-right">
                                <span className="block text-2xl font-bold text-amber-600">{totalViews}</span>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Vues (Caché)</span>
                            </div>
                        </div>
                        <div className="relative border-l border-slate-200 ml-2 space-y-6 pl-4">
                            {viewEvents.map(evt => (
                                <div key={evt.id} className="relative">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                    <p className="text-sm font-medium text-slate-700">
                                        Consultation Résidence
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        {(evt.metadata as any)?.residenceName || evt.residenceId || 'Inconnue'}
                                    </p>
                                    <p className="text-[10px] text-slate-400 mt-0.5">
                                        {evt.createdAt.toLocaleDateString()} à {evt.createdAt.toLocaleTimeString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Favorites */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-rose-600" />
                            Favoris
                        </h2>
                        <ul className="space-y-2">
                            {profile.favorites.map(fav => (
                                <li key={fav.id} className="text-sm p-2 hover:bg-slate-50 rounded bg-white flex justify-between items-center border border-slate-100">
                                    <span className="truncate max-w-[150px]">{fav.unit.residence.name}</span>
                                    <span className="text-xs text-slate-400">{fav.createdAt.toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            </div>
        </div>
    );
}

function ShieldIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
    )
}
