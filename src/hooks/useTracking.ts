'use client';

import { useCallback } from 'react';
import { trackEvent } from '@/lib/tracking';

export function useTracking() {
    const track = useCallback((eventType: string, data: {
        userId?: string;
        residenceId?: string;
        city?: string;
        metadata?: any;
    } = {}) => {
        // Optimistic / Fire and forget
        trackEvent({
            eventType,
            ...data
        });
    }, []);

    return { track };
}
