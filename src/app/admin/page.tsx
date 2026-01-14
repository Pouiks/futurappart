import { getDashboardStats } from './actions';
import { Search, Mail, MousePointer, TrendingUp, Download, Eye } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensure no caching for realtime stats

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    // Calculate simple conversion rate (Leads / Clicks on Offer)
    // Note: Clicks represent interested users (looking at details or clicking CTA)
    // Real funnel: Search -> View -> Click CTA -> Request Sent
    const conversionRate = stats.totalClicks > 0
        ? ((stats.totalLeads / stats.totalClicks) * 100).toFixed(1)
        : '0';

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-slate-500 mt-1">Vue d'ensemble des 30 derniers jours</p>
                </div>
                {/* Future: Export button using the SQL View */}
                <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors shadow-sm font-medium">
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <KPICard
                    title="Recherches"
                    value={stats.totalSearches}
                    icon={Search}
                    trend="N/A"
                    color="blue"
                />
                <KPICard
                    title="Vues Fiche"
                    value={stats.totalViews}
                    icon={Eye}
                    trend="vs m-1"
                    color="orange"
                />
                <KPICard
                    title="Intentions (Clics)"
                    value={stats.totalClicks}
                    icon={MousePointer}
                    trend="vs m-1"
                    color="purple"
                />
                <KPICard
                    title="Leads Envoyés"
                    value={stats.totalLeads}
                    icon={Mail}
                    trend="vs m-1"
                    color="green"
                />
                <KPICard
                    title="Taux Transfo"
                    value={`${conversionRate}%`}
                    icon={TrendingUp}
                    trend="Clic → Lead"
                    color="slate"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Evolution Chart (Placeholder for now, can implement Recharts if requested) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Évolution des Leads</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {stats.leadEvolution.length === 0 ? (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">Aucune donnée sur la période</div>
                        ) : (
                            stats.leadEvolution.map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                    <div
                                        className="w-full bg-blue-100 rounded-t-sm group-hover:bg-blue-600 transition-colors relative"
                                        style={{ height: `${Math.max(10, Math.min(100, (day.count / 10) * 100))}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {day.count}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 -rotate-45 origin-top-left mt-2">{day.date}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Cities */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="text-lg font-bold text-slate-900 mb-6">Top Villes Demandées</h3>
                    <div className="space-y-4">
                        {stats.topCities.map((city, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 text-sm">
                                        {i + 1}
                                    </div>
                                    <span className="font-medium capitalization text-slate-700">{city.city}</span>
                                </div>
                                <span className="font-bold text-slate-900">{city.count}</span>
                            </div>
                        ))}
                        {stats.topCities.length === 0 && (
                            <div className="text-slate-400 text-sm text-center">Aucune recherche enregistrée</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Simple Component for cleanliness
function KPICard({ title, value, icon: Icon, trend, color }: any) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        slate: 'bg-slate-50 text-slate-600',
        orange: 'bg-orange-50 text-orange-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${(colors as any)[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">{trend}</span>}
            </div>
            <div>
                <span className="block text-2xl font-bold text-slate-900">{value}</span>
                <span className="text-sm font-medium text-slate-500">{title}</span>
            </div>
        </div>
    );
}
