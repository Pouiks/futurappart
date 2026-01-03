import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

export const Footer = () => {
    const t = useTranslations('Footer');

    return (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 border-t border-gray-800">
            <div className="container mx-auto px-4 md:px-8 max-w-[1600px]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                    {/* Brand Column */}
                    <div>
                        <Link href="/" className="flex items-center gap-2 mb-6 text-white">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">M</div>
                            <span className="text-xl font-bold tracking-tight">MonLogementEtudiant</span>
                        </Link>
                        <p className="text-gray-400 mb-6 leading-relaxed">
                            {t('description')}
                        </p>
                    </div>

                    {/* SEO Links: Cities */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">{t('cities')}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/ville/paris" className="hover:text-blue-400 text-sm">Logement Paris</Link></li>
                            <li><Link href="/ville/lyon" className="hover:text-blue-400 text-sm">Logement Lyon</Link></li>
                            <li><Link href="/ville/bordeaux" className="hover:text-blue-400 text-sm">Logement Bordeaux</Link></li>
                            <li><Link href="/ville/marseille" className="hover:text-blue-400 text-sm">Logement Marseille</Link></li>
                        </ul>
                    </div>

                    {/* SEO Links: Types */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">{t('types')}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/residence-etudiante" className="hover:text-blue-400 text-sm">Résidence étudiante</Link></li>
                            <li><Link href="/colocation" className="hover:text-blue-400 text-sm">Colocation</Link></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-6">{t('legal')}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/mentions-legales" className="hover:text-blue-400 text-sm">{t('terms')}</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 text-sm">{t('contact')}</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} MonLogementEtudiant.com</p>
                </div>
            </div>
        </footer>
    );
};
