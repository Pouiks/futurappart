import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ShieldCheck, Users, BadgeCheck, ArrowRight } from 'lucide-react';

export const NoGuarantorSection = () => {
    const t = useTranslations('NoGuarantor');

    return (
        <section className="py-24 bg-white">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <div className="inline-flex items-center px-4 py-2 bg-violet-50 text-violet-700 rounded-full text-sm font-bold mb-6 border border-violet-100">
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Dossier Sécurisé
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold font-heading mb-6 text-slate-900">
                        {t('title')}
                    </h2>
                    <p className="text-lg text-slate-600 leading-relaxed font-medium">
                        {t('subtitle')}
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

                    {/* Garantme */}
                    <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 transition-all duration-300 relative">
                        <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mb-6 text-violet-600 shadow-sm group-hover:scale-110 transition-transform">
                            <BadgeCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{t('solutions.garantme.title')}</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {t('solutions.garantme.desc')}
                        </p>
                    </div>

                    {/* Visale */}
                    <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 transition-all duration-300 relative">
                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600 shadow-sm group-hover:scale-110 transition-transform">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{t('solutions.visale.title')}</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {t('solutions.visale.desc')}
                        </p>
                    </div>

                    {/* Family */}
                    <div className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-violet-200 hover:-translate-y-1 transition-all duration-300 relative">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                            <Users className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{t('solutions.family.title')}</h3>
                        <p className="text-slate-600 leading-relaxed">
                            {t('solutions.family.desc')}
                        </p>
                    </div>

                </div>

                {/* Footer CTA */}
                <div className="text-center">
                    <Link
                        href="/blog/trouver-un-garant-guide"
                        className="inline-flex items-center px-8 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-full shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                    >
                        {t('cta')}
                        <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                </div>

            </div>
        </section>
    );
};
