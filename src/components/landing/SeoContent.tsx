import React from 'react';
import { useTranslations } from 'next-intl';
import { Scale, ShieldCheck, Users } from 'lucide-react';

export const SeoContent = () => {
    const t = useTranslations('SeoContent');

    return (
        <section className="py-16 md:py-24 bg-white">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">

                <div className="text-center mb-16 max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight font-heading">
                        {t('title')}
                    </h1>
                    <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 lg:gap-12 items-stretch">

                    {/* Column 1: Comparator */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                            <Scale className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            {t('col1.title')}
                        </h2>
                        <div className="text-slate-600 leading-relaxed space-y-4">
                            <p dangerouslySetInnerHTML={{ __html: t.raw('col1.p1') }} />
                            <p>{t('col1.p2')}</p>
                        </div>
                    </div>

                    {/* Column 2: Reliability */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            {t('col2.title')}
                        </h2>
                        <p className="text-slate-600 leading-relaxed">
                            {t('col2.text')}
                        </p>
                    </div>

                    {/* Column 3: Stats/Profiles */}
                    <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6 text-emerald-600">
                            <Users className="w-7 h-7" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">
                            {t('col3.title')}
                        </h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-1">✓</span>
                                <span className="text-slate-600" dangerouslySetInnerHTML={{ __html: t.raw('col3.studio') }} />
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-1">✓</span>
                                <span className="text-slate-600" dangerouslySetInnerHTML={{ __html: t.raw('col3.coloc') }} />
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-emerald-500 font-bold mt-1">✓</span>
                                <span className="text-slate-600" dangerouslySetInnerHTML={{ __html: t.raw('col3.coliving') }} />
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </section>
    );
};
