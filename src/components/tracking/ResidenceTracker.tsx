'use client';

import { useEffect } from 'react';
import { useTracking } from '@/hooks/useTracking';

export default function ResidenceTracker({
    residenceId,
    residenceName,
    city
}: {
    residenceId: string,
    residenceName: string,
    city: string
}) {
    const { track } = useTracking();

    useEffect(() => {
        track('view_residence', {
            residenceId,
            city,
            metadata: { residenceName }
        });
    }, [residenceId, residenceName, city, track]);

    return null; // Invisible component
}
