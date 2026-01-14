import { Link } from '@/i18n/navigation';
import { ArrowLeft } from 'lucide-react';

export default function CGVPage() {
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
                            Conditions Générales de Vente (CGV)
                        </h1>
                        <p className="text-gray-500 font-medium">Dernière mise à jour : 10 janvier 2026 • FuturAppart (Modèle B2B)</p>
                    </header>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                1. Éditeur
                            </h2>
                            <p className="mb-4">
                                Les services décrits ci-dessous sont fournis par <strong>FuturAppart</strong>, société par actions
                                simplifiée (SAS), dont le siège social est situé au <strong>117 rue Pierre Bouyeron</strong>.
                            </p>
                            <p>
                                Contact : <a href="mailto:contact@futurappart.fr" className="text-blue-600 hover:underline font-bold">contact@futurappart.fr</a>
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                2. Objet
                            </h2>
                            <p>
                                Les présentes CGV encadrent les services fournis par FuturAppart aux résidences étudiantes dans le cadre
                                d’un modèle d’apporteur d’affaires (mise en relation qualifiée).
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                3. Nature du service
                            </h2>
                            <p>
                                FuturAppart fournit un service de mise en relation entre des étudiants à la recherche d’un logement et des
                                résidences étudiantes (partenaires). FuturAppart n’intervient à aucun moment dans la conclusion du contrat de location.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                4. Rémunération
                            </h2>
                            <p className="mb-4">
                                La rémunération de FuturAppart est définie contractuellement avec chaque partenaire et peut prendre la forme
                                d’une commission, d’un forfait ou d’un abonnement.
                            </p>
                            <p className="mb-4">
                                La rémunération est due uniquement selon les conditions prévues dans le contrat commercial signé entre les
                                parties.
                            </p>
                            <p>
                                À ce jour, FuturAppart ne propose pas de paiement en ligne via la plateforme. La facturation, lorsqu’elle
                                existe, est réalisée hors ligne selon les modalités contractuelles.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                5. Absence de garantie
                            </h2>
                            <p>
                                FuturAppart est tenu à une obligation de moyens et non de résultat. Aucune garantie n’est donnée quant au
                                nombre de demandes, à leur conversion, ou à la signature effective de baux.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                6. Facturation et paiement
                            </h2>
                            <p>
                                Les modalités de facturation et de paiement sont définies au contrat. Tout retard de paiement pourra
                                entraîner des pénalités conformément à la réglementation applicable.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                7. Responsabilité
                            </h2>
                            <p>
                                La responsabilité financière de FuturAppart est strictement limitée au montant des sommes perçues au titre
                                de la prestation concernée, sauf disposition légale impérative contraire.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                8. Résiliation
                            </h2>
                            <p>
                                Chaque partie peut mettre fin à la relation contractuelle selon les modalités prévues au contrat commercial
                                conclu entre les parties.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                <span className="w-1.5 h-6 bg-blue-600 rounded mr-3"></span>
                                9. Droit applicable
                            </h2>
                            <p>
                                Les présentes CGV sont soumises au droit français. Tribunal compétent : tribunal du siège de FuturAppart.
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
