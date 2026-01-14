'use client';

import React from 'react';

interface DossierProgressBarProps {
    progress: number; // 0 to 100
    totalDocs: number;
    completedDocs: number;
}

export function DossierProgressBar({ progress, totalDocs, completedDocs }: DossierProgressBarProps) {
    return (
        <div className="w-full bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Progression du dossier</h3>
                    <p className="text-xs text-gray-500">Complétez vos pièces pour maximiser vos chances</p>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-blue-600">{Math.round(progress)}%</span>
                    <span className="text-xs text-gray-400 font-medium block">
                        {completedDocs} / {totalDocs} documents
                    </span>
                </div>
            </div>

            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                {/* Background Stripes for activity effect */}
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-30 z-10"></div>

                {/* Bar */}
                <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000 ease-out rounded-full relative"
                    style={{ width: `${progress}%` }}
                >
                    {/* Shine effect */}
                    <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/20 to-transparent"></div>
                </div>
            </div>
        </div>
    );
}
