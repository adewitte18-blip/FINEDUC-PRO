/**
 * Agrège les 4 fichiers JSON en une collection unique de modules.
 * Génère également les flashcards à partir des points_clés.
 */
import type { Module, Flashcard, Parcours } from './types'

// Imports statiques — bundlés par Next.js à la build time
import financeData from '../data/finance_traditionnelle.json'
import comptaData from '../data/compta_droit_fiscal.json'
import sectorielData from '../data/financement_sectoriel.json'
import marchesData from '../data/marches_defi_softskills.json'

// ─────────────────────────────────────────────
//  Catalogue complet des modules
// ─────────────────────────────────────────────

export const ALL_MODULES: Module[] = [
  ...(financeData.modules as unknown as Module[]),
  ...(comptaData.modules as unknown as Module[]),
  ...(sectorielData.modules as unknown as Module[]),
  ...(marchesData.modules as unknown as Module[]),
]

export function getModuleById(id: string): Module | undefined {
  return ALL_MODULES.find((m) => m.id === id)
}

export function getModulesByDomain(domain: string): Module[] {
  return ALL_MODULES.filter((m) => m.domain === domain)
}

export function getModulesByLevel(level: string): Module[] {
  return ALL_MODULES.filter((m) => m.level === level)
}

export const DOMAINS = [...new Set(ALL_MODULES.map((m) => m.domain))]

// ─────────────────────────────────────────────
//  Flashcards — générées depuis points_cles
// ─────────────────────────────────────────────

export const ALL_FLASHCARDS: Flashcard[] = ALL_MODULES.flatMap((module) =>
  (module.cours.points_cles || []).map((point, idx) => {
    // Découpe naturelle : avant le '—' ou ':' ou après 80 chars
    const dashIdx = point.indexOf(' — ')
    const colonIdx = point.indexOf(' : ')
    const splitIdx =
      dashIdx > 0 && dashIdx < 80
        ? dashIdx
        : colonIdx > 0 && colonIdx < 80
        ? colonIdx
        : -1

    let recto: string
    let verso: string

    if (splitIdx > 0) {
      recto = point.substring(0, splitIdx).trim()
      verso = point.substring(splitIdx + 3).trim()
    } else {
      // Fallback : créer une question depuis le module
      recto = `Concept clé — ${module.label} (#${idx + 1})`
      verso = point
    }

    return {
      id: `${module.id}-fc-${idx}`,
      moduleId: module.id,
      recto,
      verso,
      categorie: module.domain,
    } satisfies Flashcard
  })
)

export function getFlashcardsByModule(moduleId: string): Flashcard[] {
  return ALL_FLASHCARDS.filter((fc) => fc.moduleId === moduleId)
}

export function getFlashcardsByDomain(domain: string): Flashcard[] {
  return ALL_FLASHCARDS.filter((fc) => {
    const mod = getModuleById(fc.moduleId)
    return mod?.domain === domain
  })
}

// ─────────────────────────────────────────────
//  Parcours guidés
// ─────────────────────────────────────────────

export const PARCOURS_LIST: Parcours[] = [
  {
    id: 'fondamentaux',
    label: 'Fondamentaux Crédit PME',
    description:
      'Maîtrisez les bases de l\'analyse financière et du crédit bancaire pour instruire vos premiers dossiers PME.',
    icon: '🏦',
    color: '#F5D000',
    moduleIds: ['m1', 'm2', 'mcompta', 'm3', 'mfis'],
    targetAudience: 'Chargés d\'affaires juniors, 0-2 ans',
    estimatedHours: 22,
    level: 'Intermédiaire',
  },
  {
    id: 'innovation',
    label: 'Financement de l\'Innovation',
    description:
      'Spécialisez-vous dans l\'instruction de dossiers deeptech, startups et JEI. Dispositifs Bpifrance complets.',
    icon: '🚀',
    color: '#5CE37C',
    moduleIds: ['m6', 'm17ia', 'm18s', 'm15t', 'meval', 'm13'],
    targetAudience: 'Chargés d\'affaires Innovation, Tech',
    estimatedHours: 26,
    level: 'Avancé',
  },
  {
    id: 'secteurs',
    label: 'Financement Sectoriel',
    description:
      'Tous les secteurs clés : agroalimentaire, immobilier, hôtellerie, retail, viticulture, industrie.',
    icon: '🌾',
    color: '#3C3430',
    moduleIds: ['m7', 'm8', 'm9', 'm10', 'm11', 'm16i'],
    targetAudience: 'Chargés d\'affaires spécialisés',
    estimatedHours: 24,
    level: 'Avancé',
  },
  {
    id: 'comite',
    label: 'Préparation Comité',
    description:
      'Préparez vos passages en comité d\'engagement avec les modules les plus challengés et des simulations.',
    icon: '🎯',
    color: '#F5D000',
    moduleIds: ['m1', 'm2', 'm3', 'm4', 'mtra', 'meval', 'msoft'],
    targetAudience: 'Tous niveaux — avant un comité',
    estimatedHours: 28,
    level: 'Expert',
  },
  {
    id: 'transmission',
    label: 'LBO & Transmission',
    description:
      'Maîtrisez les opérations de transmission, LBO, valorisation et structuration du financement.',
    icon: '🔄',
    color: '#5CE37C',
    moduleIds: ['mtra', 'meval', 'm5', 'm13', 'mjur'],
    targetAudience: 'Chargés d\'affaires Entreprises, PE',
    estimatedHours: 22,
    level: 'Expert',
  },
  {
    id: 'defi-marches',
    label: 'Marchés & DeFi',
    description:
      'Comprenez les marchés financiers, les cryptoactifs et la DeFi pour accompagner vos clients sur les nouveaux actifs.',
    icon: '⛓️',
    color: '#3C3430',
    moduleIds: ['m12', 'm14', 'md1', 'md2', 'md3', 'md4', 'md5'],
    targetAudience: 'Chargés d\'affaires Marchés, Digital',
    estimatedHours: 30,
    level: 'Expert',
  },
  {
    id: 'expert-complet',
    label: 'Parcours Expert Complet',
    description:
      'L\'intégralité des 31 modules pour une montée en compétence exhaustive sur tous les domaines.',
    icon: '🏆',
    color: '#F5D000',
    moduleIds: ALL_MODULES.map((m) => m.id),
    targetAudience: 'Ambition d\'excellence tous niveaux',
    estimatedHours: ALL_MODULES.reduce((sum, m) => sum + parseInt(m.duration || '3'), 0),
    level: 'Expert',
  },
]

export function getParcoursById(id: string): Parcours | undefined {
  return PARCOURS_LIST.find((p) => p.id === id)
}

// ─────────────────────────────────────────────
//  Test de positionnement — sélection de questions
// ─────────────────────────────────────────────

export interface PositionnementQuestion {
  question: string
  options: string[]
  reponse_correcte: number
  explication: string
  moduleId: string
  domain: string
}

// Sélectionne 1-2 questions par domaine pour le test de positionnement
export const POSITIONNEMENT_QUESTIONS: PositionnementQuestion[] = (() => {
  const domainModules: Record<string, Module[]> = {}
  for (const m of ALL_MODULES) {
    if (!domainModules[m.domain]) domainModules[m.domain] = []
    domainModules[m.domain].push(m)
  }

  const questions: PositionnementQuestion[] = []

  for (const [domain, modules] of Object.entries(domainModules)) {
    // Prendre la première question du premier module de chaque domaine
    const mod = modules[0]
    if (mod.quiz && mod.quiz.length > 0) {
      questions.push({
        ...mod.quiz[0],
        moduleId: mod.id,
        domain,
      })
    }
    // Deuxième question si domaine principal
    if (
      ['Finance traditionnelle', 'Financement sectoriel'].includes(domain) &&
      modules.length > 1 &&
      modules[1].quiz?.length > 0
    ) {
      questions.push({
        ...modules[1].quiz[0],
        moduleId: modules[1].id,
        domain,
      })
    }
  }

  return questions.slice(0, 12) // max 12 questions pour le test
})()

// ─────────────────────────────────────────────
//  Utilitaires
// ─────────────────────────────────────────────

export function getLevelColor(level: string): string {
  switch (level) {
    case 'Débutant':
      return 'bg-blue-100 text-blue-700'
    case 'Intermédiaire':
      return 'bg-yellow-100 text-yellow-700'
    case 'Avancé':
      return 'bg-orange-100 text-orange-700'
    case 'Expert':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

export function getDomainIcon(domain: string): string {
  const icons: Record<string, string> = {
    'Finance traditionnelle': '📊',
    'Comptabilité & Performance': '📚',
    'Droit · Fiscalité · Transmission': '⚖️',
    'Financement sectoriel': '🏭',
    'Marchés et investissement': '📈',
    'Finance décentralisée': '⛓️',
    'Évaluation & Risques': '🎯',
    'Compétences métier': '💬',
  }
  return icons[domain] || '📌'
}

export function getTagColor(tag: string): string {
  const tagColors: Record<string, string> = {
    Fondamental: 'bg-brand-yellow text-brand-brown',
    Prioritaire: 'bg-brand-green text-brand-brown',
    Comptabilité: 'bg-blue-100 text-blue-700',
    Juridique: 'bg-purple-100 text-purple-700',
    Fiscal: 'bg-orange-100 text-orange-700',
    Valorisation: 'bg-red-100 text-red-700',
    Marchés: 'bg-indigo-100 text-indigo-700',
    DeFi: 'bg-cyan-100 text-cyan-700',
    Soft: 'bg-pink-100 text-pink-700',
  }
  return tagColors[tag] || 'bg-gray-100 text-gray-600'
}
