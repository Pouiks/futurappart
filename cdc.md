# MonLogementEtudiant - Cahier des Charges & Spécifications

## 1. Vision & Architecture

### 1.1 Mission
Centraliser l'offre de logements étudiants en France en offrant une expérience **"Student First"** : design moderne, transparence des prix, candidatures simplifiées (sans dossier papier) et réponse garantie.

### 1.2 Stack Technique
- **Frontend** : Next.js 14 (App Router), React 18, Tailwind CSS, Lucide React.
- **Backend Layers** :
    - **API Routes** : Next.js Server Actions & API Routes (`/api/search`, `/api/leads`).
    - **ORM** : Prisma avec typage strict.
    - **Database** : PostgreSQL (Supabase) avec extensions (pg_trgm pour search flou si besoin).
- **Authentification** : Supabase Auth (Middleware pour protection routes Admin).
- **Infrastructure** : Vercel (Hosting) + Supabase (BaaS).

---

## 2. Règles de Gestion par Epic

### Epic 1 : Recherche & Découverte (UX Front)

#### 1.1 Landing & Recherche (Hero)
- **Barre de Recherche Compacte** : Centrée verticalement (min-height 75vh).
- **Champs** :
    - **Ville** : Select avec top villes (Paris, Lyon, Bordeaux...). Normalisée en minuscule/kebab-case.
    - **Date d'arrivée** : DatePicker personnalisé (min-date = J+3).
    - **Budget** : Slider dynamique (300€ - 2000€+).
    - **Typologies** : Multi-select (Studio, Coloc, Coliving).
- **Règle de validation** : Bouton "Rechercher" désactivé tant qu'aucune ville n'est sélectionnée.

#### 1.2 Algorithme de Recherche (`/api/search`)
- **Filtrage Strict** :
    - `cityNormalized` match exact.
    - `price` <= Budget Max.
    - `surface` >= Surface Min (defaut 0).
    - `type` inclus dans la sélection.
- **Scoring & Ranking** :
    - Les résultats sont triés par un **Score de Pertinence** (0-100).
    - Critères pondérés :
        - *Trust Score* (Fiabilité résidence).
        - *Ratio Qualité Prix/Surface* (vs Médiane de la ville).
        - *Disponibilité* (Immédiate > Future).
- **Statistiques Dynamiques** :
    - Si les stats de la ville (prix médian) n'existent pas en base (`CityStatsDaily`), l'API les calcule à la volée sur le dataset trouvé (fallback robuste).
- **Pagination** :
    - Retourne les 12 meilleures "Recommandations" + les suivants dans "Autres".
    - Tracking asynchrone : Événement `search_submitted` et `recommendation_shown` (Top 3).

#### 1.3 Page Détail Résidence
- **SEO** : Metadonnées générées dynamiquement (`[Type] à [Ville] - [Prix]€`).
- **Galerie Intelligente** : Si pas de photos réelles, génération déterministe d'images placeholder de haute qualité (basée sur le hash de l'ID) pour éviter les trous visuels.
- **Score Affiché** : Le score de qualité (calculé vs marché local) est affiché de manière transparente.
- **Éléments de Réassurance** : Badges (Vérifié, Dispo immédiate, Pas de frais cachés).

---

### Epic 2 : Conversion (Lead Management) & Règles Canoniques

Cette section définit les règles **strictes** de gestion des leads. Aucune interprétation n'est permise.

#### 2.1 Modèle Canonique Résidence (Target)
Chaque Résidence doit posséder ces champs pour piloter la distribution :

| Champ | Type | Description |
| :--- | :--- | :--- |
| `status` | ENUM | `'NON_PARTNER'` \| `'PARTNER_EMAIL'` \| `'PARTNER_SLA'` |
| `leadCapDaily` | Int? | Plafond journalier (null = illimité) |
| `leadCapWeekly` | Int? | Plafond hebdomadaire (null = illimité) |
| `leadsSentToday` | Int | Compteur journalier |
| `leadsSentThisWeek` | Int | Compteur hebdomadaire |
| `notificationEmail` | String? | Email destinataire (Requis si Partner) |
| `slaDays` | Int? | Délai de réponse (Uniquement si `PARTNER_SLA`) |

#### 2.2 Routing du Lead (Backend)

**Règle R1 — Éligibilité**
- **SI** dossier utilisateur incomplet (Manque Infos/Garant) :
    - **REFUS** (403 Forbidden).
    - Message UI : "Veuillez compléter votre dossier avant de postuler."
- **SINON** : Continuer.

**Règle R2 — Vérification des Caps**
- **SI** `leadCapDaily` est défini **ET** `leadsSentToday` >= `leadCapDaily` → **Cap atteint**.
- **SI** `leadCapWeekly` est défini **ET** `leadsSentThisWeek` >= `leadCapWeekly` → **Cap atteint**.
- **SINON** → Cap OK.

**Règle R3 — Matrice de Décision (Routing)**

| Statut Résidence | Cap atteint ? | Action Backend | Destination |
| :--- | :--- | :--- | :--- |
| `NON_PARTNER` | N/A | **REDIRECT** | URL Officielle Résidence |
| `PARTNER_EMAIL` | Non | **EMAIL** | `notificationEmail` |
| `PARTNER_EMAIL` | Oui | **REDIRECT** | URL Officielle Résidence |
| `PARTNER_SLA` | Non | **EMAIL** | `notificationEmail` |
| `PARTNER_SLA` | Oui | **REDIRECT** | URL Officielle Résidence |

*Pseudo-code de référence :*
```typescript
function routeLead(residence, userProfile) {
  if (!userProfile.isComplete) throw new Error('PROFILE_INCOMPLETE');

  const capReached =
    (residence.leadCapDaily && residence.leadsSentToday >= residence.leadCapDaily) ||
    (residence.leadCapWeekly && residence.leadsSentThisWeek >= residence.leadCapWeekly);

  if (residence.status === 'NON_PARTNER' || capReached) {
    return { channel: 'REDIRECT', destination: residence.officialContactUrl };
  }

  return { channel: 'EMAIL', destination: residence.notificationEmail };
}
```

#### 2.3 Interface Utilisateur (Frontend)

**Règle B — Badges & Affichage**
- **Titre Partenaire** :
    - SI `status` est `PARTNER_EMAIL` ou `PARTNER_SLA` → Afficher badge **"Résidence Partenaire"**.
    - SINON → Aucun badge.
- **Badge SLA** :
    - SI `status` est `PARTNER_SLA` → Afficher **"Réponse sous {slaDays} jours"**.
    - SINON → Masquer.

**Règle M — Feedback Post-Soumission**
Le message affiché à l'utilisateur dépend du canal réellement utilisé :

| Scénario Routing | Message Affiché |
| :--- | :--- |
| **Cas 1** : `NON_PARTNER` | "Votre demande a été transmise via les canaux officiels de la résidence." |
| **Cas 2** : `PARTNER_EMAIL` | "Votre demande a été transmise à la résidence. Vous recevrez une copie par email." |
| **Cas 3** : `PARTNER_SLA` | "Votre demande a été transmise. Cette résidence s’engage à vous répondre sous **{slaDays} jours**." |
| **Cas 4** : Overflow (Cap atteint) | "Votre demande a été transmise via les canaux officiels de la résidence en raison d’un fort volume de demandes." |

---

### Epic 3 : Acquisition & Scoring

#### 3.1 Règles de Priorisation (Scoring)
La priorisation commerciale (Partenariat) ne doit **jamais** dégrader la pertinence intrinsèque (Qualité/Prix) de manière excessive. 

**Règle P1 — Bonus Partenaire**
- **SI** `PARTNER_SLA` → Bonus = **+5 points**.
- **SI** `PARTNER_EMAIL` → Bonus = **+2 points**.
- **SI** `NON_PARTNER` → Bonus = **0 point**.

**Calcul Final** : 
`FinalScore = Min(BaseScore + Bonus, 100)`

#### 3.2 Tableau Récapitulatif
| Statut | Envoi Lead | Cap Leads | Badge UI | Message Succès | Bonus Score |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **NON_PARTNER** | Redirect | ❌ | ❌ | "Canaux officiels" | +0 |
| **PARTNER_EMAIL** | Email | ✅ | "Partenaire" | "Transmis" | +2 |
| **PARTNER_SLA** | Email | ✅ | "Partenaire" + "SLA" | "Réponse sous Xj" | +5 |

#### 3.3 Dashboard Admin
- **KPIs Temps Réel** :
    - Volume de Recherches, Clics, Leads.
    - Taux de Transformation global.
- **Visualisation** : Graphiques d'évolution jour par jour et Top Villes.

---

### Epic 4 : CMS & SEO

#### 4.1 Pages Villes (CityContent)
- Contenu éditorial administrable pour chaque ville cible.
- Structure JSON flexible pour enrichir la page (Quartiers, Transports, Prix du marché).
- Objectif : Capturer le trafic longue traîne ("Logement étudiant Angers").

#### 4.2 Blog System (`/blog`)
- Système de publication complet.
- **Statuts** : Draft, Published, Archived.
- **Auteurs & Catégories** : Liés aux articles pour le maillage interne.

---

### Epic 5 : Analytics & Tracking

#### 5.1 Event Tracking Propriétaire
Table `Event` pour stocker l'historique brut sans dépendance tiers (cookie-less friendly).
- `search_submitted` : Critères de recherche (Budget, Ville).
- `recommendation_shown` : Quelles résidences sont vues en top position.
- `cta_clicked` : Intention de contact.
- `lead_sent` : Succès de l'envoi.

#### 5.2 Reporting
- Vue SQL `analytics_events_flat` pour faciliter les exports CSV et l'analyse BI (Tableau, Metabase).
