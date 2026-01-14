import { prisma } from '@/lib/db';
import { Eye, FileText, User } from 'lucide-react';
import Link from 'next/link';

export default async function UsersPage() {
    // Fetch users with stats
    // Note: Profile table is the core user table
    const users = await prisma.profile.findMany({
        orderBy: { updatedAt: 'desc' },
        include: {
            _count: {
                select: {
                    requests: true,
                    favorites: true,
                }
            }
        },
        take: 50 // Pagination later
    });

    // We also need event stats (e.g. view counts). 
    // GroupBy on Events is needed, but Prisma groupBy + relation is tricky.
    // For list view, maybe we just show basic activity. Detail view will have full stats.

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Utilisateurs 360</h1>
                <p className="text-slate-500 mt-1">Vue d'ensemble des candidats et de leur activité.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Utilisateur</th>
                            <th className="px-6 py-4">Statut</th>
                            <th className="px-6 py-4 text-center">Dossiers</th>
                            <th className="px-6 py-4 text-center">Favoris</th>
                            <th className="px-6 py-4 text-right">Dernière activité</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{user.firstName} {user.lastName}</div>
                                            <div className="text-slate-500 text-xs">{user.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100 uppercase">
                                        {user.status || 'Actif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`font-bold ${user._count.requests > 0 ? 'text-blue-600' : 'text-slate-400'}`}>
                                        {user._count.requests}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-slate-600 font-medium">{user._count.favorites}</span>
                                </td>
                                <td className="px-6 py-4 text-right text-slate-500 text-xs">
                                    {user.updatedAt.toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Link
                                        href={`/admin/users/${user.id}`}
                                        className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold transition-colors"
                                    >
                                        <Eye className="w-3 h-3" />
                                        Voir 360
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
