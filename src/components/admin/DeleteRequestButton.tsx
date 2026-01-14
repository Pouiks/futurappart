'use client';

import { Trash2 } from 'lucide-react';
import { useTransition } from 'react';
import { deleteSubscriptionRequest } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export function DeleteRequestButton({ requestId }: { requestId: string }) {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
            startTransition(async () => {
                const res = await deleteSubscriptionRequest(requestId);
                if (res.success) {
                    router.refresh();
                } else {
                    alert('Erreur lors de la suppression');
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Supprimer ce dossier"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    );
}
