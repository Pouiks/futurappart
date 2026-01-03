'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export const StickySubNav = () => {
    // const t = useTranslations('LogementNav'); // Assuming we add translations later, hardcode for now or use generic keys
    const [activeSection, setActiveSection] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['highlights', 'description', 'amenities', 'location', 'price'];
            let current = '';

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) { // Offset for navbar height
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // 80px navbar + 20px padding
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    const navItems = [
        { id: 'highlights', label: 'Atouts' },
        { id: 'description', label: 'Description' },
        { id: 'amenities', label: 'Équipements' },
        { id: 'location', label: 'Localisation' },
        // { id: 'price', label: 'Prix & Dossier' } // Maybe optional if visually explicit in sidebar
    ];

    return (
        <nav className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm hidden md:block">
            <div className="max-w-[1600px] mx-auto px-8">
                <ul className="flex items-center gap-8 h-14 text-sm font-bold text-gray-500">
                    {navItems.map((item) => (
                        <li key={item.id}>
                            <a
                                href={`#${item.id}`}
                                onClick={(e) => scrollTo(item.id, e)}
                                className={`h-14 flex items-center border-b-2 transition-colors ${activeSection === item.id
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent hover:text-blue-600 hover:border-blue-200'
                                    }`}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </nav>
    );
};
