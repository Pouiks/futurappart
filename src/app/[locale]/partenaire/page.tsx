"use client";

import React, { useActionState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { CheckCircle2, ShieldCheck, Mail, BarChart3, Users, ArrowRight, Wallet, Lock, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { submitPartnerContact } from '@/app/actions/contact';
import { toast } from 'sonner';

const initialState = null;

export default function PartnerPage() {
    const [state, formAction, isPending] = useActionState(submitPartnerContact, initialState);

    // Feedback Effect
    useEffect(() => {
        if (state?.success) {
            toast.success("Votre demande a été envoyée ! Nous vous recontacterons rapidement.");
        } else if (state?.error) {
            toast.error(state.error);
        }
    }, [state]);

    return (
        <div className="min-h-screen bg-white">

            {/* SECTION 1 - HERO */}
            <section className="relative overflow-hidden bg-slate-900 text-white py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="container mx-auto px-4 max-w-5xl relative z-10 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-bold uppercase tracking-wider mb-6">
                        Espace Partenaire
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        Devenez partenaire du comparateur <br className="hidden md:block" />
                        <span className="text-blue-400">Mon Logement Étudiant</span>
                    </h1>
                    <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Recevez des demandes de logement qualifiées, déjà complètes, sans gestion technique ni engagement de volume.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <a href="#contact" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto">
                            Être contacté pour devenir partenaire
                        </a>
                    </div>
                </div>
            </section>

            {/* SECTION 2 - VALUE PROP */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Notre mission : simplifier la mise en relation</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Mon Logement Étudiant est un comparateur indépendant qui agrège l'offre existante pour orienter les étudiants vers les résidences qui correspondent réellement à leurs critères (budget, ville, typologie).
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Users,
                                title: "Trafic Qualifié",
                                desc: "Des milliers d'étudiants utilisent notre plateforme chaque mois pour comparer les offres avant de postuler."
                            },
                            {
                                icon: ShieldCheck,
                                title: "Transparence",
                                desc: "Nous affichons les informations réelles (prix, services) pour éviter les déconvenues et les dossiers inutiles."
                            },
                            {
                                icon: LayoutList,
                                title: "Offre Centralisée",
                                desc: "Une vue d'ensemble du marché qui permet aux étudiants de faire un choix éclairé rapidement."
                            }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-100 transition-colors">
                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 mb-6">
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* SECTION 3 - DATA COLLECTION (QUALITY) */}
            <section className="py-20 bg-slate-50 border-y border-gray-200">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                        <div className="flex-1">
                            <div className="inline-block px-4 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-bold mb-6">
                                Qualité Garantie
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">
                                Comment nous collectons les dossiers
                            </h2>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                                Contrairement aux portails classiques, nous ne transmettons pas de simples "contacts".
                                Pour postuler, un étudiant doit <strong>obligatoirement créer un compte</strong> et compléter son dossier locatif numérique.
                            </p>

                            <ul className="space-y-4 mb-8">
                                {[
                                    "Identité et coordonnées vérifiées",
                                    "Projet validé (Ville, Date, Budget)",
                                    "Statut (Étudiant / Jeune Actif)",
                                    "Informations sur les garants"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <div className="p-4 bg-white border-l-4 border-emerald-500 rounded-r-lg shadow-sm">
                                <p className="text-emerald-900 font-medium">
                                    "Aucune demande incomplète ou non qualifiée n’est transmise aux partenaires."
                                </p>
                            </div>
                        </div>
                        <div className="flex-1 w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100/50">
                            <div className="space-y-6 opacity-75">
                                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                <div className="space-y-2">
                                    <div className="h-10 bg-blue-50 rounded border border-blue-100"></div>
                                    <div className="h-10 bg-blue-50 rounded border border-blue-100"></div>
                                </div>
                                <div className="h-32 bg-gray-50 rounded border border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
                                    Pièces justificatives
                                </div>
                                <div className="w-full h-12 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">
                                    Dossier Complet ✅
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4 - ROUTING */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-5xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Comment les demandes sont transmises</h2>
                        <p className="text-gray-600">Un processus adapté à votre niveau d'intégration.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Case 1 */}
                        <div className="p-8 rounded-2xl border border-gray-200 bg-gray-50/50">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">1</div>
                                <h3 className="text-lg font-bold text-gray-900">Résidences non partenaires</h3>
                            </div>
                            <p className="text-gray-600 mb-6 h-20">
                                L'étudiant consulte votre fiche mais ne peut pas postuler en direct. Il est redirigé vers vos canaux publics (site web, téléphone).
                            </p>
                            <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg text-sm font-medium text-gray-500">
                                Redirection Web Simple ↗
                            </div>
                        </div>

                        {/* Case 2 */}
                        <div className="p-8 rounded-2xl border-2 border-blue-100 bg-blue-50/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">RECOMMANDÉ</div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">2</div>
                                <h3 className="text-lg font-bold text-gray-900">Résidences Partenaires</h3>
                            </div>
                            <p className="text-gray-600 mb-6 h-20">
                                Vous recevez directement les dossiers complets par email structuré (ou API). Vous traitez la demande immédiatement sans ressaisie.
                            </p>
                            <div className="flex items-center justify-center p-4 bg-white border border-blue-200 rounded-lg text-sm font-bold text-blue-700 shadow-sm">
                                <Mail className="w-4 h-4 mr-2" />
                                Réception Dossier PDF / JSON
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 5 - CONTROL & VOLUME */}
            <section className="py-20 bg-slate-900 text-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-6">Contrôle du Volume & Qualité</h2>
                    <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                        Notre algorithme ne vise pas le volume de masse, mais la pertinence.
                        Nous savons qu'une résidence complète n'a pas besoin de 500 dossiers refusés.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-6 text-left max-w-2xl mx-auto">
                        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-blue-400" />
                                Quotas ajustables
                            </h4>
                            <p className="text-slate-400 text-sm">Définissez un nombre maximum de dossiers par jour ou par semaine.</p>
                        </div>
                        <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                            <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-blue-400" />
                                Anti-Spam
                            </h4>
                            <p className="text-slate-400 text-sm">Nous bloquons les envois multiples abusifs pour préserver vos équipes.</p>
                        </div>
                    </div>
                    <div className="mt-12 inline-block px-6 py-3 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-medium">
                        "Nous privilégions la qualité des demandes plutôt que la quantité."
                    </div>
                </div>
            </section>

            {/* SECTION 6 - PARTNERSHIP MODEL */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1">
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">Un modèle sain et sans contraintes</h2>
                            <p className="text-lg text-gray-600 mb-8">
                                L'objectif est de vous apporter de la valeur dès le premier jour, sans risque financier ou technique.
                            </p>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shrink-0 text-green-700">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Performance uniquement</h4>
                                        <p className="text-gray-600">Pas de frais d'installation, pas d'abonnement fixe. Facturation basée uniquement sur les dossiers qualifiés transmis.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center shrink-0 text-orange-700">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Sans engagement</h4>
                                        <p className="text-gray-600">Vous pouvez suspendre ou arrêter le partenariat à tout moment si le flux ne vous convient pas.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 p-4 bg-purple-50 rounded-xl border border-purple-100 text-purple-900 text-sm">
                                <strong>Bonus Visibilité :</strong> Les partenaires engagés sur un délai de réponse (SLA) bénéficient d’une mise en avant spécifique (badge "Réponse Rapide").
                            </div>
                        </div>
                        <div className="flex-1 w-full flex justify-center">
                            <div className="relative w-full max-w-sm aspect-square bg-gray-100 rounded-full flex items-center justify-center">
                                <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-gray-100 max-w-[280px]">
                                    <div className="text-4xl font-extrabold text-gray-900 mb-2">0€</div>
                                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Frais fixes</div>
                                    <div className="h-px bg-gray-100 w-full mb-4"></div>
                                    <p className="text-gray-600 text-sm">
                                        Seule la performance compte. Vous ne payez que si vous recevez des demandes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 7 - CTA / CONTACT */}
            <section id="contact" className="py-20 bg-slate-50 border-t border-gray-200">
                <div className="container mx-auto px-4 max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Intéressé pour devenir partenaire ?</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        Nous vous présentons le fonctionnement en détail et définissons ensemble le mode de réception le plus adapté à votre organisation.
                    </p>

                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 text-left">
                        {state?.success ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h3>
                                <p className="text-gray-600 mb-6">
                                    Merci de votre intérêt. Notre équipe Partenariats reviendra vers vous sous 24h ouvrées.
                                </p>
                                <button onClick={() => window.location.reload()} className="text-blue-600 font-medium hover:underline">
                                    Envoyer une autre demande
                                </button>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nom de la résidence / Groupe</label>
                                        <input
                                            name="residenceName"
                                            type="text"
                                            className={`w-full px-4 py-3 rounded-lg border ${state?.fieldErrors?.residenceName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:ring-2 outline-none transition placeholder:text-gray-400 text-gray-900`}
                                            placeholder="Ex: Groupe Réside Etudes"
                                            required
                                        />
                                        {state?.fieldErrors?.residenceName && <p className="text-red-500 text-xs mt-1">{state.fieldErrors.residenceName[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Ville(s) concernée(s)</label>
                                        <input
                                            name="cities"
                                            type="text"
                                            className={`w-full px-4 py-3 rounded-lg border ${state?.fieldErrors?.cities ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:ring-2 outline-none transition placeholder:text-gray-400 text-gray-900`}
                                            placeholder="Ex: Lyon, Paris, ..."
                                            required
                                        />
                                        {state?.fieldErrors?.cities && <p className="text-red-500 text-xs mt-1">{state.fieldErrors.cities[0]}</p>}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Votre Nom</label>
                                        <input
                                            name="name"
                                            type="text"
                                            className={`w-full px-4 py-3 rounded-lg border ${state?.fieldErrors?.name ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:ring-2 outline-none transition placeholder:text-gray-400 text-gray-900`}
                                            placeholder="Jean Dupont"
                                            required
                                        />
                                        {state?.fieldErrors?.name && <p className="text-red-500 text-xs mt-1">{state.fieldErrors.name[0]}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email Professionnel</label>
                                        <input
                                            name="email"
                                            type="email"
                                            className={`w-full px-4 py-3 rounded-lg border ${state?.fieldErrors?.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'} focus:ring-2 outline-none transition placeholder:text-gray-400 text-gray-900`}
                                            placeholder="jean@groupe.com"
                                            required
                                        />
                                        {state?.fieldErrors?.email && <p className="text-red-500 text-xs mt-1">{state.fieldErrors.email[0]}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Message (Optionnel)</label>
                                    <textarea
                                        name="message"
                                        rows={3}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition placeholder:text-gray-400 text-gray-900"
                                        placeholder="Précisez votre volume de lits ou vos questions..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isPending}
                                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition transform active:scale-[0.98] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Envoi en cours...
                                        </>
                                    ) : (
                                        "Nous contacter"
                                    )}
                                </button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    En cliquant, vous acceptez d'être recontacté par notre équipe. Vos données ne sont pas partagées.
                                </p>
                            </form>
                        )}
                    </div>
                </div>
            </section>

        </div>
    );
}

// Icon Helper
function LayoutList({ className }: { className?: string }) {
    return (
        <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="7" height="7" x="3" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="3" rx="1" />
            <rect width="7" height="7" x="14" y="14" rx="1" />
            <rect width="7" height="7" x="3" y="14" rx="1" />
        </svg>
    )
}
