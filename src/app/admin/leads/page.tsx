import { getLeadsReport, getPartners } from './actions';
import { Calendar, User, Building, Mail, Phone, ChevronRight, ChevronDown } from 'lucide-react';
import LeadFilters from './LeadFilters';
import RelaunchButton from './RelaunchButton';

export default async function LeadsPage({ searchParams }: { searchParams?: Promise<{ start?: string, end?: string, partner?: string, search?: string }> }) {

    const resolvedParams = await searchParams;
    const stats = await getLeadsReport({
        startDate: resolvedParams?.start || undefined,
        endDate: resolvedParams?.end || undefined,
        partnerId: resolvedParams?.partner || undefined,
        search: resolvedParams?.search || undefined
    });

    const partners = await getPartners();

    // Calculate Global Totals
    const totalLeads = stats.reduce((acc: number, p: any) => acc + p.count, 0);

    return (
        <div className="space-y-8">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dossiers & Leads</h1>
                    <p className="text-slate-500 mt-1">Suivi des demandes de contact par Partenaire et Résidence.</p>
                </div>

                <LeadFilters partners={partners} />
            </div>

            {/* KPI OVERVIEW */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Mail className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-sm text-slate-500 font-medium">Leads Générés</div>
                        <div className="text-3xl font-extrabold text-slate-900">{totalLeads}</div>
                    </div>
                </div>
                {/* We could add generic Conversion Rate here if we had Traffic Data available in specific context */}
            </div>

            {/* DATA TABLE */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-bold text-lg text-slate-800">Détail par Marque / Résidence</h2>
                </div>

                <div className="divide-y divide-slate-100">
                    {stats.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">
                            Aucune donnée sur la période sélectionnée.
                        </div>
                    ) : (
                        stats.map((partner: any) => (
                            <div key={partner.id} className="group">
                                {/* PARTNER ROW (Summary) */}
                                <div className="bg-slate-50 p-4 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                                            {partner.name.substring(0, 2)}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-900 capitalize">{partner.name}</div>
                                            <div className="text-xs text-slate-500">{partner.residences.length} résidences actives</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-bold text-slate-900">{partner.count}</div>
                                            <div className="text-xs text-slate-500">Total Leads</div>
                                        </div>
                                        <ChevronDown className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>

                                {/* RESIDENCES (Detailed) */}
                                <div className="divide-y divide-slate-50 border-t border-slate-100">
                                    {partner.residences.map((res: any) => (
                                        <details key={res.name} className="group/res open:bg-blue-50/30 transition-colors">
                                            <summary className="flex items-center justify-between p-4 pl-14 cursor-pointer hover:bg-slate-50 list-none">
                                                <div className="flex items-center gap-3">
                                                    <Building className="w-4 h-4 text-slate-400" />
                                                    <span className="font-medium text-slate-700">{res.name}</span>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="font-bold text-slate-900 px-3 py-1 bg-slate-100 rounded-full text-xs">
                                                        {res.count} leads
                                                    </span>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 group-open/res:rotate-90 transition-transform" />
                                                </div>
                                            </summary>

                                            {/* LEAD DETAILS (User Info) */}
                                            <div className="pl-14 pr-4 pb-4">
                                                <table className="w-full text-sm text-left text-slate-600 bg-white rounded-lg border border-slate-100 overflow-hidden">
                                                    <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                                                        <tr>
                                                            <th className="px-4 py-2 font-medium">Date</th>
                                                            <th className="px-4 py-2 font-medium">Utilisateur</th>
                                                            <th className="px-4 py-2 font-medium">Contact</th>
                                                            <th className="px-4 py-2 font-medium text-right">Statut</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {res.leads.map((lead: any) => (
                                                            <tr key={lead.id} className="hover:bg-slate-50/50">
                                                                <td className="px-4 py-3 whitespace-nowrap">
                                                                    {new Date(lead.date).toLocaleDateString()} <span className="text-slate-400 text-xs">{new Date(lead.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                </td>
                                                                <td className="px-4 py-3 font-medium text-slate-900">
                                                                    {lead.user?.firstName} {lead.user?.lastName}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <div className="flex flex-col text-xs gap-0.5">
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Mail className="w-3 h-3 text-slate-400" />
                                                                            {lead.user?.email}
                                                                        </div>
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                                            {lead.user?.phone || '-'}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${lead.status === 'SENT' ? 'bg-green-100 text-green-700' :
                                                                        lead.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                                                        }`}>
                                                                        {lead.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-right">
                                                                    <RelaunchButton leadId={lead.id} />
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </details>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
