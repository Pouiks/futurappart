import { getBrandStats } from './actions';
import { BarChart3, Download, Building, Users } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function BrandAnalyticsPage() {
    const stats = await getBrandStats();

    // Calculate totals
    const totalViews = stats.reduce((acc, s) => acc + s.views, 0);
    const totalLeads = stats.reduce((acc, s) => acc + s.leads, 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Statistiques Marques</h1>
                    <p className="text-slate-500 mt-1">Rapport mensuel d'activité par partenaire.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Building className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500 uppercase">Partenaires Actifs</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{stats.length}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><BarChart3 className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500 uppercase">Vues Totales (Mois)</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{totalViews}</div>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><Users className="w-5 h-5" /></div>
                        <span className="text-sm font-bold text-slate-500 uppercase">Leads Totaux (Mois)</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900">{totalLeads}</div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="px-6 py-4">Marque</th>
                            <th className="px-6 py-4 text-center">Résidences</th>
                            <th className="px-6 py-4 text-center text-amber-700 bg-amber-50/50">Vues</th>
                            <th className="px-6 py-4 text-center text-green-700 bg-green-50/50">Leads</th>
                            <th className="px-6 py-4 text-center">Taux Conv.</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {stats.map(brand => {
                            const conversionRate = brand.views > 0 ? ((brand.leads / brand.views) * 100).toFixed(1) : '0.0';

                            return (
                                <tr key={brand.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">
                                        {brand.name}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-600">
                                        {brand.residenceCount}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-amber-700 bg-amber-50/30">
                                        {brand.views}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-green-700 bg-green-50/30">
                                        {brand.leads}
                                    </td>
                                    <td className="px-6 py-4 text-center text-slate-500 text-xs">
                                        {conversionRate}%
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
