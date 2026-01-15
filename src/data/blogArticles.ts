import { StaticImageData } from 'next/image';

export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    content: React.ReactNode; // Using ReactNode for rich content (JSX)
    date: string;
    readTime: string;
    category: string;
    image?: string; // URL for now
}

export const blogPosts: BlogPost[] = [
    {
        slug: 'aides-logement',
        title: 'Les Aides au Logement Étudiant 2025 : Le Guide Complet',
        excerpt: 'APL, ALS, Mobili-Jeune... Ne passez pas à côté de centaines d\'euros. Découvrez toutes les aides disponibles et comment les cumuler pour réduire votre loyer.',
        date: '2 Janvier 2025',
        readTime: '5 min',
        category: 'Aides Financières',
        content: `
            <div class="space-y-6 text-gray-700 leading-relaxed">
                <p class="text-xl font-medium text-gray-900 border-l-4 border-blue-600 pl-4 bg-blue-50 py-4 rounded-r-lg">
                    Le loyer représente 60% du budget étudiant. Heureusement, la France dispose d'un des systèmes d'aides les plus généreux au monde. Encore faut-il savoir les demander.
                </p>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">1. L'APL (Aide Personnalisée au Logement)</h2>
                <p>
                    C'est la plus connue. Elle est versée par la <strong>CAF</strong> (Caisse d'Allocations Familiales).
                    Elle concerne les logements conventionnés (la majorité des résidences étudiantes et HLM).
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Montant :</strong> Jusqu'à 250€/mois (variable selon zone et revenus).</li>
                    <li><strong>Conditions :</strong> Être locataire en titre, logement décent.</li>
                    <li><strong>Bon à savoir :</strong> Les revenus de vos parents ne sont pas pris en compte pour le calcul (sauf si vous êtes rattaché à leur foyer fiscal pour l'IFI, cas rare).</li>
                </ul>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">2. L'ALS (Allocation de Logement Social)</h2>
                <p>
                    Si votre logement n'est pas conventionné (souvent le cas avec les particuliers ou certaines vieilles résidences), vous toucherez l'ALS.
                    Le montant est généralement très proche de l'APL. Faites la simulation sur le site de la CAF, c'est le même formulaire.
                </p>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Mobili-Jeune : Le Bonus pour les Alternants</h2>
                <p>
                    Vous êtes en contrat d'apprentissage ou de professionnalisation ? Action Logement vous verse une aide supplémentaire.
                </p>
                <div class="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
                    <h3 class="font-bold text-emerald-800 mb-2">🚀 Le Hack Mobili-Jeune</h3>
                    <p class="text-emerald-700">
                        Cette aide (entre 10€ et 100€/mois) est <strong>CUMULABLE</strong> avec les APL.
                        C'est souvent oublié, mais cela peut payer vos frais d'électricité !
                    </p>
                </div>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">Quand faire la demande ?</h2>
                <p>
                    <strong>Dès la signature du bail !</strong> N'attendez pas d'emménager. L'ouverture des droits commence le mois suivant votre demande.
                    Si vous emménagez en Septembre et demandez en Novembre, vous perdez Septembre et Octobre définitivement.
                </p>

                <div class="mt-8 text-center">
                    <a href="https://wwwd.caf.fr/wps/portal/caffr/aidesetdemarches/mesdemarches/faireunesimulation" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 text-white font-bold py-3 px-8 rounded-full hover:bg-blue-700 transition">
                        Faire ma simulation CAF >
                    </a>
                </div>
            </div>
        `
    },
    {
        slug: 'trouver-un-garant-guide',
        title: 'Comment Louer sans Garant en 2025 ? Les Solutions',
        excerpt: 'Pas de famille en France ? Parents retraités ? Le garant physique n\'est plus obligatoire. Visale, Garantme, Unkle... Comparatif des solutions 2.0.',
        date: '28 Décembre 2024',
        readTime: '4 min',
        category: 'Dossier Locatif',
        content: `
            <div class="space-y-6 text-gray-700 leading-relaxed">
                <p class="text-xl font-medium text-gray-900">
                    Le "Garant obligatoire", c'est la hantise des étudiants, surtout internationaux. Mais le marché a changé. Aujourd'hui, un dossier avec une garantie institutionnelle est souvent PRÉFÉRÉ par les propriétaires.
                </p>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">1. La Garantie Visale (Le Graal)</h2>
                <p>
                    C'est un dispositif d'État (Action Logement). C'est <strong>Gratuit</strong> pour vous et le propriétaire.
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Pour qui ?</strong> Tous les étudiants de moins de 30 ans (même sans revenus).</li>
                    <li><strong>Couverture :</strong> Jusqu'à 36 mois de loyers impayés.</li>
                    <li><strong>Délai :</strong> Visa certifié en 48h ouvrées.</li>
                </ul>
                <div class="bg-amber-50 p-4 border-l-4 border-amber-500 my-4 text-amber-900">
                    <strong>Attention :</strong> Le plafond est de 600€ de loyer mon max (800€ en Île-de-France). Si votre loyer dépasse, Visale ne couvre rien du tout.
                </div>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">2. Garantme (La solution premium)</h2>
                <p>
                    Si vous n'êtes pas éligible Visale ou si votre loyer est élevé, Garantme est la référence privée.
                </p>
                <ul class="list-disc list-inside space-y-2 ml-4">
                    <li><strong>Coût :</strong> Environ 3.5% du montant du loyer annuel.</li>
                    <li><strong>Avantage :</strong> Ils délivrent un certificat d'éligibilité en 2h. Très rassurant pour les bailleurs privés.</li>
                    <li>futurappart est partenaire et peut accélérer votre dossier.</li>
                </ul>

                <h2 class="text-2xl font-bold text-gray-900 mt-8 mb-4">3. Le Garant Bancaire (Obsolète)</h2>
                <p>
                    Bloquer 1 an de loyer sur un compte bloqué ? C'est l'ancienne méthode. Elle est coûteuse et bloque votre épargne. À éviter sauf dernier recours.
                </p>
            </div>
        `
    }
];
