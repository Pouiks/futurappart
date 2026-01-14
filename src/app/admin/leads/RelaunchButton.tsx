'use client';

import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { relaunchStudentEmail } from './relaunch-actions';

export default function RelaunchButton({ leadId }: { leadId: string }) {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleRelaunch = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent details expanding/collapsing if inside summary
        e.stopPropagation();

        if (!confirm("Voulez-vous envoyer un email de relance à cet étudiant ?")) return;

        setStatus('loading');
        const res = await relaunchStudentEmail(leadId);

        if (res.success) {
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            alert("Erreur: " + res.error);
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <span className="inline-flex items-center gap-1 text-green-600 text-xs font-bold px-2 py-1 bg-green-50 rounded border border-green-100">
                <CheckCircle className="w-3 h-3" /> Relancé
            </span>
        );
    }

    if (status === 'loading') {
        return (
            <span className="inline-flex items-center gap-1 text-gray-400 text-xs px-2 py-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Envoi...
            </span>
        );
    }

    return (
        <button
            onClick={handleRelaunch}
            className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2 py-1 rounded transition-colors text-xs font-medium"
            title="Envoyer un email de relance au candidat"
        >
            <Send className="w-3 h-3" /> Relancer
        </button>
    );
}
