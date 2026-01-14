'use client';

import React, { useState, useEffect } from 'react';
import { X, Trophy } from 'lucide-react';

export function InactivityNudge() {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenDismissed, setHasBeenDismissed] = useState(false);

    useEffect(() => {
        if (hasBeenDismissed) return;

        // Timer: Show after 3 minutes (180000ms)
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 180000);

        return () => clearTimeout(timer);
    }, [hasBeenDismissed]);

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border border-blue-100 relative overflow-hidden">
                {/* Close Button */}
                <button
                    onClick={() => { setIsVisible(false); setHasBeenDismissed(true); }}
                    className="absolute top-2 right-2 p-1 text-gray-300 hover:text-gray-500 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Decoration */}
                <div className="absolute -top-6 -right-6 w-20 h-20 bg-blue-50 rounded-full opacity-50"></div>

                <div className="flex gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600 mb-2">
                        <Trophy className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 leading-tight mb-1">
                            Pense à terminer ton dossier !
                        </h4>
                        <p className="text-sm text-gray-500 leading-relaxed">
                            Un dossier complet, c'est 3x plus de chances d'obtenir le logement de tes rêves. Courage, c'est presque fini ! 🚀
                        </p>
                    </div>
                </div>

                <div className="mt-4 flex justify-end">
                    <button
                        onClick={() => { setIsVisible(false); setHasBeenDismissed(true); }}
                        className="text-blue-600 text-xs font-bold hover:underline"
                    >
                        Je continue
                    </button>
                </div>
            </div>
        </div>
    );
}
