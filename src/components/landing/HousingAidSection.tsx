import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Euro, BookOpen, ArrowRight, Calculator, FileText, Banknote, ClipboardList, ExternalLink } from 'lucide-react';

export const HousingAidSection = () => {
    const t = useTranslations('HousingAid');

    return (
        <section className="py-24 bg-blue-900 text-white overflow-hidden relative">
            {/* Soft Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-900" />

            {/* Decor Circles */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 -translate-x-1/2 translate-y-1/2" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                    {/* LEFT: Text Content */}
                    <div className="space-y-8">
                        <div className="inline-flex items-center space-x-2 text-yellow-400 font-bold uppercase tracking-wider text-sm">
                            <Euro className="w-5 h-5" />
                            <span>Pouvoir d'achat</span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-extrabold font-heading leading-tight">
                            {t.rich('title', {
                                caf: (chunks) => <span className="text-yellow-400">{chunks}</span>
                            })}
                        </h2>

                        <div className="space-y-6 text-lg text-blue-100 leading-relaxed max-w-xl">
                            <p className="font-semibold text-white">
                                {t('intro')}
                            </p>
                            <p>
                                {t('p1')}
                            </p>
                            <p className="text-base italic opacity-80 border-l-4 border-yellow-400 pl-4">
                                {t('p2')}
                            </p>
                        </div>

                        <div className="pt-4">
                            <Link
                                href="/blog/aides-logement"
                                className="inline-flex items-center px-8 py-4 bg-yellow-400 text-blue-900 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 transition-all hover:scale-105 group"
                            >
                                <BookOpen className="w-5 h-5 mr-3" />
                                {t('cta')}
                                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT: Timeline / Steps */}
                    <div className="relative">
                        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

                            <h3 className="text-xl font-bold mb-8 flex items-center text-white">
                                <ClipboardList className="w-6 h-6 text-blue-400 mr-3" />
                                3 Étapes clés à anticiper
                            </h3>

                            <div className="space-y-12 relative before:absolute before:left-6 before:top-2 before:bottom-10 before:w-0.5 before:bg-blue-500/30">

                                {/* Step 1 - Linked to CAF */}
                                <a
                                    href="https://wwwd.caf.fr/wps/portal/caffr/aidesetdemarches/mesdemarches/faireunesimulation"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="relative flex items-start group cursor-pointer"
                                >
                                    <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-800 border-2 border-blue-400 flex items-center justify-center z-10 group-hover:bg-yellow-400 group-hover:border-yellow-200 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                                        <Calculator className="w-6 h-6 text-white group-hover:text-blue-900 transition-colors" />
                                    </div>
                                    <div className="pl-16 pt-2">
                                        <h4 className="font-bold text-lg text-white mb-1 group-hover:text-yellow-400 transition-colors flex items-center">
                                            Simulation
                                            <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </h4>
                                        <p className="text-blue-200 group-hover:text-blue-100 transition-colors">{t('timeline.step1')}</p>
                                    </div>
                                </a>

                                {/* Step 2 */}
                                <div className="relative flex items-start group">
                                    <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-800 border-2 border-blue-400 flex items-center justify-center z-10 group-hover:bg-blue-600 transition-colors">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="pl-16 pt-2">
                                        <h4 className="font-bold text-lg text-white mb-1 group-hover:text-yellow-400 transition-colors">Dossier</h4>
                                        <p className="text-blue-200">{t('timeline.step2')}</p>
                                    </div>
                                </div>

                                {/* Step 3 */}
                                <div className="relative flex items-start group">
                                    <div className="absolute left-0 w-12 h-12 rounded-full bg-blue-800 border-2 border-blue-400 flex items-center justify-center z-10 group-hover:bg-blue-600 transition-colors">
                                        <Banknote className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="pl-16 pt-2">
                                        <h4 className="font-bold text-lg text-white mb-1 group-hover:text-yellow-400 transition-colors">Versement</h4>
                                        <p className="text-blue-200">{t('timeline.step3')}</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};
