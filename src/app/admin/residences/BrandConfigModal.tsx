'use client';

import { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { updatePartnerConfig } from './actions';

export default function BrandConfigModal({
    isOpen,
    onClose,
    brands
}: {
    isOpen: boolean;
    onClose: () => void;
    brands: { sourceId: string, defaultPrice: number }[]
}) {
    // We expect brands to have { sourceId, defaultPrice, defaultEmail }
    // but Typescript might not know about defaultEmail yet if generation failed.
    const [config, setConfig] = useState<Record<string, { price: number, email: string }>>(
        brands.reduce((acc, b) => ({
            ...acc,
            [b.sourceId]: {
                price: b.defaultPrice,
                // @ts-ignore
                email: b.defaultEmail || ''
            }
        }), {})
    );
    const [saving, setSaving] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleSave = async (sourceId: string) => {
        setSaving(sourceId);
        await updatePartnerConfig(sourceId, Number(config[sourceId].price), config[sourceId].email);
        setSaving(null);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Configuration des Marques</h2>
                        <p className="text-sm text-slate-500">Définissez le prix par défaut (Prix Marque) pour chaque partenaire.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                <div className="overflow-y-auto p-6 space-y-4">
                    <div className="bg-slate-50 p-4 rounded-xl flex items-start gap-3 text-sm text-slate-600 mb-6">
                        <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium text-slate-900 mb-1">Fonctionnement de l'héritage :</p>
                            <p>Si vous laissez le prix d'une résidence <strong>vide</strong> dans la liste principale, elle utilisera ce <strong>Prix Marque</strong>.</p>
                            <p>Si vous mettez un prix spécifique (même 0€), il sera prioritaire sur ce prix marque.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {brands.map((brand) => (
                            <div key={brand.sourceId} className="flex flex-col gap-2 p-3 border border-slate-200 rounded-xl hover:border-blue-200 transition-colors bg-white">
                                <span className="font-medium text-slate-700 capitalize">
                                    {brand.sourceId.includes('excel') ? 'Import Excel' : brand.sourceId.replace(/_/g, ' ')}
                                </span>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-400 w-16">Prix (€)</label>
                                        <input
                                            type="number"
                                            value={config[brand.sourceId]?.price ?? 0}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                [brand.sourceId]: { ...config[brand.sourceId], price: Number(e.target.value) }
                                            })}
                                            className="flex-1 text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3"
                                            min="0"
                                            placeholder="Prix"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-slate-400 w-16">Email</label>
                                        <input
                                            type="email"
                                            value={config[brand.sourceId]?.email ?? ''}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                [brand.sourceId]: { ...config[brand.sourceId], email: e.target.value }
                                            })}
                                            className="flex-1 text-sm border-slate-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 px-3"
                                            placeholder="Email de notification"
                                        />
                                    </div>
                                    <div className="flex justify-end mt-1">
                                        <button
                                            onClick={() => handleSave(brand.sourceId)}
                                            disabled={saving === brand.sourceId}
                                            className="w-full py-1.5 bg-slate-100 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors disabled:opacity-50 text-xs font-bold"
                                        >
                                            {saving === brand.sourceId ? '...' : 'Enregistrer'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
