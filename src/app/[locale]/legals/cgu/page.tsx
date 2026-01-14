import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';

export default function CGUPage() {
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
                            Conditions Générales d’Utilisation (CGU)
                        </h1>
                        <p className="text-gray-500 font-medium">Dernière mise à jour : 10 janvier 2026 • FuturAppart</p>
                    </header>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                1. Éditeur du service
                            </h2>
                            <p className="mb-4">
                                Le service FuturAppart est édité par <strong>FuturAppart</strong>, société par actions simplifiée (SAS),
                                dont le siège social est situé au <strong>117 rue Pierre Bouyeron</strong>.
                            </p>
                            <p>
                                Contact : <a href="mailto:contact@futurappart.fr" className="text-blue-600 hover:underline font-bold">contact@futurappart.fr</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                2. Présentation du service
                            </h2>
                            <p className="mb-4">
                                FuturAppart est une plateforme en ligne de recherche de logements étudiants en France, permettant aux utilisateurs
                                de consulter des offres, de constituer un dossier locatif et d’entrer en relation avec des résidences étudiantes
                                partenaires ou non.
                            </p>
                            <p className="mb-4">
                                FuturAppart agit exclusivement en tant qu’intermédiaire technique et apporteur de mise en relation.
                                FuturAppart n’est ni propriétaire, ni bailleur, ni agence immobilière, ni mandataire immobilier.
                            </p>
                            <p>
                                Aucune garantie n’est donnée quant à la disponibilité réelle des logements, l’exactitude exhaustive des informations
                                publiées ou l’acceptation finale d’un dossier par une résidence.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                3. Accès au service
                            </h2>
                            <p className="mb-4">
                                L’accès au moteur de recherche est libre. La création d’un compte est requise pour constituer un dossier locatif,
                                déposer des documents et transmettre une demande de logement.
                            </p>
                            <p>
                                L’authentification s’effectue via email / mot de passe ou via un compte Google (OAuth).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                4. Compte utilisateur
                            </h2>
                            <p className="mb-4">
                                L’utilisateur s’engage à fournir des informations exactes, complètes et à jour. Il est seul responsable de la
                                confidentialité de ses identifiants.
                            </p>
                            <p>
                                FuturAppart se réserve le droit de suspendre ou supprimer un compte en cas d’usage frauduleux, de fausses
                                déclarations ou de tentative de contournement du service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                5. Dossier locatif et documents
                            </h2>
                            <p className="mb-4">
                                L’utilisateur reste pleinement propriétaire des documents qu’il dépose sur la plateforme. Il garantit l’authenticité
                                et la conformité des documents transmis.
                            </p>
                            <p>
                                Les documents ne sont jamais transmis automatiquement à des tiers. Toute transmission à une résidence résulte d’une
                                action explicite de l’utilisateur.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                6. Mise en relation avec les résidences
                            </h2>
                            <p className="mb-4">
                                Lorsqu’un utilisateur transmet une demande de logement, FuturAppart transmet les informations et documents
                                sélectionnés à la résidence concernée.
                            </p>
                            <p>
                                FuturAppart n’intervient pas dans l’analyse des dossiers, la décision d’attribution ou la contractualisation finale.
                                Aucune obligation de réponse ou de résultat ne peut être exigée.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                7. Algorithmes et classement
                            </h2>
                            <p>
                                Les résultats de recherche peuvent être classés selon des critères algorithmiques (prix, surface, localisation,
                                pertinence). Ces scores sont indicatifs, non contractuels, non décisionnaires et non discriminants.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                8. Propriété intellectuelle
                            </h2>
                            <p className="mb-4">
                                L’ensemble de la plateforme, de son code, de ses algorithmes, de son design et de ses contenus propres est la
                                propriété exclusive de FuturAppart. Les contenus tiers (photos, descriptions) restent la propriété de leurs auteurs
                                respectifs.
                            </p>
                            <p>Toute reproduction non autorisée est interdite.</p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                9. Responsabilité
                            </h2>
                            <p className="mb-4">
                                FuturAppart ne saurait être tenu responsable des refus de dossiers, des erreurs de prix ou de disponibilité,
                                des interruptions temporaires du service, ni des contenus fournis par des tiers.
                            </p>
                            <p>
                                La responsabilité de FuturAppart est strictement limitée aux dommages directs avérés, dans les limites prévues par
                                la loi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                10. Droit applicable
                            </h2>
                            <p>
                                Les présentes CGU sont soumises au droit français. Tout litige relève de la compétence des tribunaux français.
                            </p>
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
