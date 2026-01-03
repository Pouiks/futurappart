
'use client';

import dynamic from 'next/dynamic';

import { Skeleton } from '@/components/ui/Skeleton';

const ResidenceMap = dynamic(
    () => import('./ResidenceMap').then((mod) => mod.ResidenceMap),
    {
        loading: () => <Skeleton className="h-full w-full rounded-xl" />,
        ssr: false
    }
);

interface ResidenceMapWrapperProps {
    address: string;
    city: string;
}

export const ResidenceMapWrapper = (props: ResidenceMapWrapperProps) => {
    return <ResidenceMap {...props} />;
};
