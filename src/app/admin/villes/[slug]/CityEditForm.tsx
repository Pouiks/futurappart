'use client';

import { useState } from 'react';
import { saveCityContent } from '../actions';
import { Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CityEditForm({ slug, initialData }: any) {
    const [loading, setLoading] = useState(false);

    // Safety check for nulls
    const [formData, setFormData] = useState({
        title: initialData?.title || `Logement étudiant à ${slug}`,
        intro: initialData?.intro || '',
        price: initialData?.price || 500,
        heroImageUrl: initialData?.heroImageUrl || '',
        transport: initialData?.transportJson || {
            summary: '', lines: [], price: ''
        },
        livingCost: initialData?.livingCostJson || {
            rent: '', food: '', transport: '', extras: ''
        }
    });

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await saveCityContent(slug, formData);
            alert("Sauvegardé avec succès !");
            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Erreur lors de la sauvegarde");
        } finally {
            setLoading(false);
        }
    };

    // Helper for nested updates
    const updateTransport = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            transport: { ...prev.transport, [field]: value }
        }));
    };

    const updateCost = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            livingCost: { ...prev.livingCost, [field]: value }
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            {/* Header / Actions */}
            <div className="flex items-center justify-between sticky top-0 bg-gray-50 z-10 py-4 shadow-sm">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 capitalize">Éditer : {slug}</h1>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                >
                    <Save className="w-4 h-4" />
                    {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* SEO / Header */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">En-tête & SEO</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Titre Principal (H1)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Introduction Marketing</label>
                                <textarea
                                    className="w-full p-2 border border-slate-200 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={formData.intro}
                                    onChange={e => setFormData({ ...formData, intro: e.target.value })}
                                />
                                <p className="text-xs text-slate-400 mt-1">Sera affiché en haut de page. Inclure les mots clés.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Image de fond (URL)</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
                                    value={formData.heroImageUrl}
                                    placeholder="https://images.unsplash.com/..."
                                    onChange={e => setFormData({ ...formData, heroImageUrl: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Transports */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Transports</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Résumé</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-slate-200 rounded-lg"
                                    value={formData.transport.summary}
                                    onChange={e => updateTransport('summary', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Prix Abonnement</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={formData.transport.price}
                                        onChange={e => updateTransport('price', e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Lignes (séparées par virgule)</label>
                                    <input
                                        type="text"
                                        className="w-full p-2 border border-slate-200 rounded-lg"
                                        value={formData.transport.lines.join(', ')}
                                        onChange={e => updateTransport('lines', e.target.value.split(',').map((s: string) => s.trim()))}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Config */}
                <div className="space-y-6">
                    {/* Budget */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">Budget étudiant</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Prix Moyen (Affiché)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full p-2 pl-8 border border-slate-200 rounded-lg"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                                    />
                                    <span className="absolute left-3 top-2 text-slate-400">€</span>
                                </div>
                            </div>

                            <hr className="my-2" />

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase">Détails (Texte libre)</label>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-sm w-20">Loyer</span>
                                    <input type="text" className="flex-1 p-1 border rounded text-sm" value={formData.livingCost.rent} onChange={e => updateCost('rent', e.target.value)} />
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-sm w-20">Bouffe</span>
                                    <input type="text" className="flex-1 p-1 border rounded text-sm" value={formData.livingCost.food} onChange={e => updateCost('food', e.target.value)} />
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-sm w-20">Transport</span>
                                    <input type="text" className="flex-1 p-1 border rounded text-sm" value={formData.livingCost.transport} onChange={e => updateCost('transport', e.target.value)} />
                                </div>
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-sm w-20">Extras</span>
                                    <input type="text" className="flex-1 p-1 border rounded text-sm" value={formData.livingCost.extras} onChange={e => updateCost('extras', e.target.value)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </form>
    );
}
