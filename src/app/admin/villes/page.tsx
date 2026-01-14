export const dynamic = 'force-dynamic';

import { getAllCitiesStatus } from './actions';
import { MapPin, Edit, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default async function AdminCitiesPage() {
    const cities = await getAllCitiesStatus();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestion des Villes</h1>
                    <p className="text-slate-500 mt-1">
                        Détection automatique basée sur les {cities.reduce((acc, c) => acc + c.residenceCount, 0)} résidences importées.
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 font-semibold text-slate-600">Ville</th>
                            <th className="p-4 font-semibold text-slate-600">Résidences</th>
                            <th className="p-4 font-semibold text-slate-600">Statut Contenu</th>
                            <th className="p-4 font-semibold text-slate-600">Dernière Modif</th>
                            <th className="p-4 font-semibold text-slate-600 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {cities.map((city) => (
                            <tr key={city.slug} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900">{city.name}</div>
                                            <div className="text-xs text-slate-400 font-mono">/ville/{city.slug}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100">
                                        {city.residenceCount} log.
                                    </span>
                                </td>
                                <td className="p-4">
                                    {city.hasContent ? (
                                        <div className="flex items-center text-green-600 gap-2">
                                            <CheckCircle className="w-4 h-4" />
                                            <span className="text-sm font-medium">Configuré</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-slate-400 gap-2">
                                            <XCircle className="w-4 h-4" />
                                            <span className="text-sm">Manquant</span>
                                        </div>
                                    )}
                                </td>
                                <td className="p-4 text-slate-500 text-sm">
                                    {city.lastUpdated ? new Date(city.lastUpdated).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <Link
                                        href={`/admin/villes/${city.slug}`}
                                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
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
