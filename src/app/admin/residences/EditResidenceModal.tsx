'use client';

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { updateResidenceConfig } from './actions';

interface EditResidenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    residence: any; // Using any for simplicity as per existing pattern, but ideally formatted type
}

export default function EditResidenceModal({ isOpen, onClose, residence }: EditResidenceModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        cityNormalized: '',
        notificationEmail: '',
        price: ''
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (residence) {
            setFormData({
                name: residence.name || '',
                address: residence.address || '',
                cityNormalized: residence.cityNormalized === 'unknown' ? '' : (residence.cityNormalized || ''),
                notificationEmail: residence.notificationEmail || '',
                price: residence.isInherited ? '' : (residence.leadPrice?.toString() || '')
            });
        }
    }, [residence]);

    if (!isOpen || !residence) return null;

    const handleSave = async () => {
        setSaving(true);
        const pricePayload = formData.price === '' ? null : Number(formData.price);

        await updateResidenceConfig(residence.id, {
            name: formData.name,
            address: formData.address,
            cityNormalized: formData.cityNormalized || 'unknown', // Fallback to unknown if empty, OR maybe user wants empty?
            notificationEmail: formData.notificationEmail,
            leadPrice: pricePayload
        });

        setSaving(false);
        onClose();
        // Router refresh is handled by the parent's Effect or we rely on the server action revalidatePath
        // Ideally we should wait a bit or trigger a refresh in parent, but action does revalidatePath.
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">Modifier la résidence</h3>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{residence.id}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">

                    {/* Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Nom de la résidence</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full text-sm border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                        />
                    </div>

                    {/* Address & City */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Adresse complète</label>
                            <textarea
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full text-sm border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Ville (Normalisée)</label>
                            <input
                                type="text"
                                value={formData.cityNormalized}
                                onChange={(e) => setFormData({ ...formData, cityNormalized: e.target.value })}
                                placeholder="ex: angers"
                                className="w-full text-sm border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 ml-1">Utilisé pour les URLs et la recherche</p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email Notification</label>
                            <input
                                type="email"
                                value={formData.notificationEmail}
                                onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
                                placeholder="contact@..."
                                className="w-full text-sm border-slate-300 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                        <label className="block text-xs font-bold text-blue-800 uppercase mb-1.5 ml-1">Prix du Lead (€)</label>
                        <div className="flex items-center gap-3">
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder={`Défaut (${residence.defaultPrice}€)`}
                                className="w-full text-sm border-blue-200 rounded-xl shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5"
                                min="0"
                            />
                            <div className="text-xs text-blue-600 leading-tight flex-1">
                                {formData.price === '' ? (
                                    <>Configuration par défaut : <span className="font-bold">{residence.defaultPrice}€</span> (hérité)</>
                                ) : (
                                    <>Prix forcé pour cette résidence</>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                        disabled={saving}
                    >
                        Annuler
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm shadow-blue-200"
                    >
                        {saving ? 'Enregistrement...' : (
                            <>
                                <Save className="w-4 h-4" />
                                Enregistrer
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
