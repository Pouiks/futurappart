'use client';

import { Filter, Search, Download } from 'lucide-react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export default function LeadFilters({ partners }: { partners: { id: string, name: string }[] }) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Local state for immediate UI feedback
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [partner, setPartner] = useState(searchParams.get('partner') || '');
    const [startDate, setStartDate] = useState(searchParams.get('start') || '');
    const [endDate, setEndDate] = useState(searchParams.get('end') || '');

    // Debounce Logic for Search
    // We update the URL only after user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (searchParams.get('search') || '')) {
                updateFilters({ search });
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            // Reset to page 1 if needed (but we don't have pagination yet)

            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const updateFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value);
            } else {
                params.delete(key);
            }
        });

        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const handlePartnerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setPartner(val);
        updateFilters({ partner: val });
    };

    const handleDateChange = (name: string, val: string) => {
        if (name === 'start') setStartDate(val);
        if (name === 'end') setEndDate(val);
        updateFilters({ [name]: val });
    };

    return (
        <div className="flex items-center gap-3">
            {/* Filters */}
            <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm transition-all focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-50">
                <Search className="w-4 h-4 text-slate-400 ml-2" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher..."
                    className="text-sm bg-transparent border-none outline-none text-slate-700 w-32 placeholder-slate-400 focus:w-48 transition-all"
                />
                <div className="w-px h-4 bg-slate-200 mx-1"></div>

                <Filter className="w-4 h-4 text-slate-400" />
                <select
                    value={partner}
                    onChange={handlePartnerChange}
                    className="text-sm font-medium bg-transparent border-none outline-none text-slate-700 w-32 cursor-pointer"
                >
                    <option value="">Tous Partenaires</option>
                    {partners.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                <div className="w-px h-4 bg-slate-200 mx-1"></div>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleDateChange('start', e.target.value)}
                    className="text-sm bg-transparent border-none outline-none text-slate-600 w-32 cursor-pointer"
                />
                <span className="text-slate-400 text-xs">à</span>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleDateChange('end', e.target.value)}
                    className="text-sm bg-transparent border-none outline-none text-slate-600 w-32 cursor-pointer"
                />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 font-medium transition-colors border border-transparent hover:border-slate-300">
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export CSV</span>
            </button>
        </div>
    );
}
