import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans text-gray-700">
            <div className="max-w-4xl mx-auto">

                {/* Back Link */}
                <div className="mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        Retour à l'accueil
                    </Link>
                </div>

                {/* Content Card */}
                <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
                    <header className="mb-10 border-b border-gray-100 pb-8">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                            Politique de Confidentialité (RGPD)
                        </h1>
                        <p className="text-gray-500 font-medium">Dernière mise à jour : 10 janvier 2026 • FuturAppart</p>
                    </header>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                1. Responsable de traitement
                            </h2>
                            <p className="mb-4">
                                Le responsable de traitement est <strong>FuturAppart</strong>, société par actions simplifiée (SAS),
                                dont le siège social est situé au <strong>117 rue Pierre Bouyeron</strong>.
                            </p>
                            <p>
                                Contact RGPD : <a href="mailto:contact@futurappart.fr" className="text-blue-600 hover:underline font-bold">contact@futurappart.fr</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                2. Données collectées
                            </h2>
                            <p className="mb-4">FuturAppart peut collecter les catégories de données suivantes :</p>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Données d’identité (nom, prénom)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Coordonnées (email)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Informations de profil (statut, budget, informations déclaratives)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Données de dossier (pièces justificatives, informations nécessaires à l’étude locative)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Données relatives aux garants (identité, justificatifs, informations déclaratives)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Données techniques (logs, adresse IP, informations nécessaires au fonctionnement et à la sécurité)</span>
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                3. Finalités
                            </h2>
                            <ul className="space-y-2 mb-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Permettre la recherche de logement</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Permettre la création de compte et l’authentification</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Permettre la constitution et la gestion d’un dossier locatif</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Permettre la mise en relation avec des résidences (transmission sur action explicite)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Assurer la sécurité et prévenir la fraude</span>
                                </li>
                            </ul>
                            <p>Aucune donnée n’est vendue à des tiers.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                4. Base légale
                            </h2>
                            <ul className="space-y-2">
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Exécution du service demandé par l’utilisateur (compte, dossier, mise en relation)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Consentement explicite (notamment pour la transmission du dossier)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-blue-600 font-bold">•</span>
                                    <span>Intérêt légitime (sécurité, amélioration du service)</span>
                                </li>
                            </ul>
                        </section>
                    </div>

                    <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                        <Link href="/" className="text-gray-400 hover:text-blue-600 text-sm font-bold transition-colors">
                            ← Retour à l'accueil
                        </Link>
                    </div>
                </article>
            </div>
        </main>
    );
}
