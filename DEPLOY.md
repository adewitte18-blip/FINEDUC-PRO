# FinEduc Pro — Guide de déploiement complet

## Stack technique
- **Frontend** : Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend** : Supabase (auth + base de données PostgreSQL)
- **Déploiement** : Vercel (tier gratuit)
- **Contenu** : 4 fichiers JSON statiques intégrés au build

---

## Étape 1 — Supabase (5 min)

### 1.1 Créer le projet
1. Aller sur [supabase.com](https://supabase.com) → "Start your project"
2. Créer un nouveau projet (région : `eu-west-1` recommandé pour la France)
3. Choisir un mot de passe de BDD fort → **Sauvegarder**
4. Attendre 2-3 min que le projet se crée

### 1.2 Créer les tables
1. Dans le dashboard Supabase → **SQL Editor** → "New query"
2. Coller le contenu de `supabase/schema.sql`
3. Cliquer **Run** (flèche verte ou Ctrl+Entrée)
4. Vérifier : Table Editor doit afficher : `profiles`, `user_progress`, `flashcard_reviews`, `positionnement_results`, `binomes`

### 1.3 Récupérer les clés API
1. **Settings** → **API**
2. Copier :
   - `Project URL` → sera `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` (public key) → sera `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.4 Configuration authentification (optionnel pour dev)
1. **Authentication** → **Settings**
2. Pour le développement : désactiver "Confirm email" (Email Confirmations → OFF)
3. Ajouter votre domaine Vercel dans "Site URL" une fois déployé

---

## Étape 2 — Installation locale (test)

```bash
# Cloner / dézipper le projet
cd fineduc-pro

# Copier le fichier d'environnement
cp .env.local.example .env.local

# Editer .env.local avec vos clés Supabase
# NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...

# Installer les dépendances
npm install

# Lancer en développement
npm run dev
# → http://localhost:3000
```

---

## Étape 3 — Déploiement Vercel (3 min)

### Option A — Via GitHub (recommandé)

1. Pousser le projet sur GitHub (repo public ou privé)
2. Aller sur [vercel.com](https://vercel.com) → "New Project"
3. Importer votre repo GitHub
4. **Environment Variables** → Ajouter :
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = votre_anon_key
   ```
5. Cliquer **Deploy** → Vercel build et déploie automatiquement

### Option B — Via CLI Vercel

```bash
npm install -g vercel

# Se connecter
vercel login

# Déployer depuis le dossier du projet
vercel

# Suivre les instructions, puis ajouter les env vars :
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Re-déployer avec les variables
vercel --prod
```

### Option C — Sans compte GitHub (drag & drop)

1. Construire la version production : `npm run build`
2. Aller sur [vercel.com](https://vercel.com)
3. Glisser-déposer le dossier du projet
4. Configurer les variables d'environnement

---

## Étape 4 — Finaliser Supabase après déploiement

1. **Supabase** → **Authentication** → **Settings** → **Site URL**
   - Ajouter : `https://votre-app.vercel.app`
2. **Redirect URLs** : ajouter `https://votre-app.vercel.app/auth/callback`

---

## Architecture du projet

```
fineduc-pro/
├── data/                          # 4 JSON statiques (31 modules)
│   ├── finance_traditionnelle.json
│   ├── compta_droit_fiscal.json
│   ├── financement_sectoriel.json
│   └── marches_defi_softskills.json
├── lib/
│   ├── types.ts                   # Types TypeScript
│   ├── content.ts                 # Agrégation modules + parcours + flashcards
│   ├── supabase.ts                # Client + fonctions DB
│   └── utils.ts                   # Utilitaires
├── app/
│   ├── page.tsx                   # Dashboard
│   ├── login/page.tsx             # Auth
│   ├── module/
│   │   ├── page.tsx               # Bibliothèque des modules
│   │   └── [id]/page.tsx          # Vue module (cours/quiz/cas/flashcards)
│   ├── parcours/page.tsx          # Parcours guidés
│   ├── flashcards/page.tsx        # Session flashcards SRS
│   ├── positionnement/page.tsx    # Test de positionnement
│   ├── comite/page.tsx            # Mode comité simulé
│   └── binomes/page.tsx           # Système de binômes
├── components/
│   ├── layout/Navbar.tsx
│   ├── modules/
│   │   ├── CourseViewer.tsx       # Rendu markdown des cours
│   │   ├── QuizEngine.tsx         # Moteur de quiz interactif
│   │   └── CasPratiqueViewer.tsx  # Visualiseur de cas pratiques
│   └── features/
│       └── FlashcardDeck.tsx      # Deck de flashcards SRS
└── supabase/schema.sql            # Schéma complet
```

---

## Fonctionnalités détaillées

| Feature | Description | Sans compte | Avec compte |
|---|---|---|---|
| **Cours** | Lecture des 31 modules avec markdown | ✅ | ✅ |
| **Quiz** | 5 questions par module avec explications | ✅ | ✅ |
| **Cas pratiques** | Dossiers financiers complets | ✅ | ✅ |
| **Flashcards SRS** | Répétition espacée SM-2 | ✅ local | ✅ sync |
| **Test positionnement** | 12 questions multi-domaines | ✅ local | ✅ sync |
| **Parcours guidés** | 7 parcours thématiques | ✅ local | ✅ sync |
| **Mode Comité** | Simulation de comité d'engagement | ✅ | ✅ |
| **Système de binômes** | Apprentissage en duo | ❌ | ✅ |
| **Progression sync** | Multi-appareils | ❌ | ✅ |

---

## Limites tier gratuit Supabase

- **500 Mo** de stockage base de données (largement suffisant)
- **50 000 requêtes/mois** (suffisant pour 50-200 utilisateurs actifs)
- **2 projets** simultanés
- Pas d'uptime garanti (peut se mettre en veille après 1 semaine d'inactivité)

→ Pour lever ces limites : Supabase Pro à $25/mois

---

## Customisation

### Changer les couleurs
Dans `tailwind.config.js`, modifier les valeurs `brand.*` :
```js
colors: {
  brand: {
    yellow: '#F5D000',  // Jaune Bpifrance
    brown:  '#3C3430',  // Brun foncé
    green:  '#5CE37C',  // Vert succès
  }
}
```

### Ajouter des modules
1. Créer un nouveau fichier JSON dans `data/`
2. Dans `lib/content.ts`, importer et ajouter aux `ALL_MODULES`
3. Ajouter au(x) parcours concerné(s) dans `PARCOURS_LIST`

---

## Support

Architecture conçue pour évoluer :
- Les données JSON sont statiques → zéro coût d'API
- Supabase gère auth + progress → scalable
- Next.js App Router → ISR possible pour les pages de modules

Pour toute question : consultez [docs.supabase.com](https://docs.supabase.com) et [nextjs.org/docs](https://nextjs.org/docs)
