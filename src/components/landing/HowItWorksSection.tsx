'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { UserCircle, FileText, Send, ClipboardCheck, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import { useEffect, useState } from 'react';

export const HowItWorksSection = () => {
    const t = useTranslations('HowItWorks');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsAuthenticated(!!session?.user);
        };
        checkUser();
    }, [supabase]);

    const ctaLink = isAuthenticated ? '/account/edit' : '/auth';

    const steps = [
        {
            icon: UserCircle,
            title: t('step1.title'),
            desc: t('step1.desc'),
            color: 'bg-blue-100 text-blue-600'
        },
        {
            icon: FileText,
            title: t('step2.title'),
            desc: t('step2.desc'),
            color: 'bg-purple-100 text-purple-600'
        },
        {
            icon: Send,
            title: t('step3.title'),
            desc: t('step3.desc'),
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            icon: ClipboardCheck,
            title: t('step4.title'),
            desc: t('step4.desc'),
            color: 'bg-green-100 text-green-600'
        }
    ];

    return (
        <section className="py-20 bg-gray-50 overflow-hidden relative">
            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 font-heading">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-gray-600">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                    {/* Visual Connector Line (Desktop Only) */}
                    <div className="hidden md:block absolute top-[56px] left-0 right-0 h-1 bg-gray-200 w-[75%] mx-auto z-0 rounded-full" />

                    {steps.map((step, idx) => (
                        <div key={idx} className="relative z-10 flex flex-col items-center text-center group">
                            {/* Icon Circle */}
                            <div className={`w-28 h-28 rounded-2xl ${step.color} flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300 relative`}>
                                <step.icon className="w-14 h-14" />
                                {/* Step Number Badge */}
                                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm border-4 border-gray-50">
                                    {idx + 1}
                                </div>
                            </div>

                            {/* Text */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                            <p className="text-gray-500 text-sm leading-relaxed px-2">
                                {step.desc}
                            </p>

                            {/* Mobile Connector (Arrow Down) */}
                            {idx < steps.length - 1 && (
                                <div className="md:hidden mt-8 mb-4">
                                    <ArrowRight className="w-6 h-6 text-gray-300 rotate-90" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <Link
                        href={ctaLink}
                        className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        {t('cta')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>
            </div>
        </section>
    );
};
