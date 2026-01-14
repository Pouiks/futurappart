'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Save, X, Edit2, CheckCircle, Settings, Filter, Trash2 } from 'lucide-react';
import { updateResidenceConfig, deleteResidence, autoAssignBrands } from './actions';
import { useRouter } from 'next/navigation';
import BrandConfigModal from './BrandConfigModal';
import EditResidenceModal from './EditResidenceModal';

// Helper to clean city names
const formatCity = (res: any) => {
    // Try normalized first, then raw city
    let city = res.cityNormalized;
    if (!city || city === 'unknown' || city === 'undefined') {
        // Fallback to address if available
        return res.address ? res.address : 'Non renseigné';
    }

    return city.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
};

// Helper to clean source
const formatSource = (source: string) => {
    if (source.includes('excel')) return 'Import Excel';
    return source.replace(/_/g, ' ').replace("canonical", "").trim();
};

export default function ResidenceList({
    initialResidences,
    initialSearch,
    brands,
    brandEntities
}: {
    initialResidences: any[],
    initialSearch: string,
    brands: { sourceId: string, defaultPrice: number }[],
    brandEntities: { id: string, name: string }[]
}) {
    // Client-side state
    const [search, setSearch] = useState(''); // Local search state
    const [filterSource, setFilterSource] = useState('');
    const [residences, setResidences] = useState(initialResidences);

    // Modal State
    const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
    const [editResidence, setEditResidence] = useState<any | null>(null);

    const router = useRouter();

    // Sync state with props (for updates like Delete)
    useEffect(() => {
        setResidences(initialResidences);
    }, [initialResidences]);

    // Client-Side Filtering
    // Dynamic filtering without server requests
    const filteredResidences = useMemo(() => {
        return residences.filter(res => {
            const query = search.toLowerCase();
            const sourceFormatted = formatSource(res.sourceId).toLowerCase();

            const matchesSearch = !search ||
                res.name.toLowerCase().includes(query) ||
                (res.cityNormalized || '').toLowerCase().includes(query) ||
                sourceFormatted.includes(query) ||
                res.sourceId.toLowerCase().includes(query);

            const matchesSource = !filterSource || (res.brandName === filterSource) || (res.sourceId === filterSource);

            return matchesSearch && matchesSource;
        });
    }, [residences, search, filterSource]);


    const handleDelete = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette résidence ? Cette action est irréversible.')) {
            await deleteResidence(id);
            router.refresh();
            // Optimistic update locally
            setResidences(prev => prev.filter(r => r.id !== id));
        }
    };

    // Auto-Scan State
    const [isScanning, setIsScanning] = useState(false);

    const handleAutoScan = async () => {
        setIsScanning(true);
        try {
            const result = await autoAssignBrands();
            alert(`${result.count} résidences ont été associées à leur marque !`);
            router.refresh();
        } catch (e) {
            alert("Erreur lors de l'auto-assignation");
            console.error(e);
        } finally {
            setIsScanning(false);
        }
    };

    // Pagination State
    const [visibleCount, setVisibleCount] = useState(50);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 50);
    };

    const displayedResidences = filteredResidences.slice(0, visibleCount);

    return (
        <div className="space-y-6">
            <BrandConfigModal
                isOpen={isBrandModalOpen}
                onClose={() => setIsBrandModalOpen(false)}
                brands={brands}
            />

            {/* Edit Modal */}
            <EditResidenceModal
                isOpen={!!editResidence}
                onClose={() => { setEditResidence(null); router.refresh(); }}
                residence={editResidence}
                brandEntities={brandEntities}
            />

            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm w-full md:w-auto focus-within:ring-2 focus-within:ring-blue-50 transition-all">
                    <Search className="w-4 h-4 text-slate-400 ml-2" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Rechercher une résidence..."
                        className="w-full md:w-64 text-sm bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 h-8"
                    />
                    <div className="w-px h-5 bg-slate-200 mx-2"></div>
                    <select
                        value={filterSource}
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="text-sm bg-transparent border-none outline-none text-slate-600 font-medium cursor-pointer hover:text-blue-600 pr-8"
                    >
                        <option value="">Toutes marques</option>
                        {brandEntities.map(b => (
                            <option key={b.id} value={b.name}>{b.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <div className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg">
                        {filteredResidences.length} résidences
                    </div>

                    <button
                        onClick={handleAutoScan}
                        disabled={isScanning}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg hover:bg-blue-100 text-sm font-medium transition-all shadow-sm disabled:opacity-50"
                        title="Scanner et associer les marques aux résidences automatiquement"
                    >
                        <CheckCircle className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                        {isScanning ? 'Scan...' : 'Auto-Scan'}
                    </button>

                    <button
                        onClick={() => setIsBrandModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 text-sm font-medium transition-all shadow-sm"
                    >
                        <Settings className="w-4 h-4" />
                        Gérer les marques
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-semibold tracking-wider">Résidence</th>
                                <th className="px-6 py-3 font-semibold tracking-wider">Ville</th>
                                <th className="px-6 py-3 font-semibold tracking-wider text-center">Logements</th>
                                <th className="px-6 py-3 font-semibold tracking-wider">Marque</th>
                                <th className="px-6 py-3 font-semibold tracking-wider w-64">Email Notification</th>
                                <th className="px-6 py-3 font-semibold tracking-wider w-32">Prix Lead (€)</th>
                                <th className="px-6 py-3 font-semibold tracking-wider text-right w-24">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {displayedResidences.map((res: any) => {
                                const isImportExcel = res.sourceId.toLowerCase().includes('excel');

                                return (
                                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-3 align-top">
                                            <div className="font-bold text-slate-900 text-sm">{res.name}</div>
                                            {res.address && <div className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] truncate" title={res.address}>{res.address}</div>}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-slate-600 capitalize text-sm">
                                            {formatCity(res)}
                                        </td>
                                        <td className="px-6 py-3 align-middle text-center">
                                            <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-full">{res._count.units}</span>
                                        </td>
                                        <td className="px-6 py-3 align-middle">
                                            {res.brandName ? (
                                                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full capitalize">
                                                    {res.brandName}
                                                </span>
                                            ) : isImportExcel ? (
                                                <span className="text-[11px] text-slate-400 italic">Import Excel</span>
                                            ) : (
                                                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-full capitalize">
                                                    {formatSource(res.sourceId)}
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-6 py-3 align-middle text-slate-700">
                                            {res.effectiveEmail ? (
                                                <div className="flex flex-col">
                                                    <span className={`text-sm ${res.isEmailInherited ? 'text-slate-500' : 'text-slate-900'}`}>
                                                        {res.effectiveEmail}
                                                    </span>
                                                    {res.isEmailInherited && (
                                                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 w-fit px-1.5 rounded mt-0.5">Par {res.brandName ? 'Marque' : 'Partenaire'}</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-slate-300 italic text-xs">Non configuré</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 align-middle">
                                            <div className="flex flex-col">
                                                <span className={`font-bold text-sm ${res.isInherited ? 'text-slate-500' : 'text-slate-900'}`}>
                                                    {res.effectivePrice} €
                                                </span>
                                                {res.isInherited && (
                                                    <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 w-fit px-1.5 rounded mt-0.5">Par {res.brandName ? 'Marque' : 'Partenaire'}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 align-middle text-right flex justify-end gap-1">
                                            <button onClick={() => setEditResidence(res)} className="p-1.5 text-slate-400 hover:text-blue-600 bg-transparent hover:bg-slate-100 rounded-lg" title="Modifier"><Edit2 className="w-4 h-4" /></button>
                                            <button onClick={() => handleDelete(res.id)} className="p-1.5 text-slate-400 hover:text-red-600 bg-transparent hover:bg-red-50 rounded-lg ml-1" title="Supprimer"><Trash2 className="w-4 h-4" /></button>
                                        </td>
                                    </tr>
                                )
                            })
                            }
                        </tbody>
                    </table>

                    {filteredResidences.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            Aucune résidence trouvée
                        </div>
                    ) : (
                        visibleCount < filteredResidences.length && (
                            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg shadow-sm hover:bg-slate-50 font-medium transition-all text-sm"
                                >
                                    Voir plus de résidences ({filteredResidences.length - visibleCount} restants)
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}
