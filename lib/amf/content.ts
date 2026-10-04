import type { AmfThemeFile, AmfModule, AmfQuestion, AmfExam } from './types'

// ─── Imports statiques AMF généraliste ───────────────────────────────────────
import genT01 from '../../data/amf/generaliste/theme-01.json'
import genT02 from '../../data/amf/generaliste/theme-02.json'
import genT03 from '../../data/amf/generaliste/theme-03.json'
import genT04 from '../../data/amf/generaliste/theme-04.json'
import genT05 from '../../data/amf/generaliste/theme-05.json'
import genT06 from '../../data/amf/generaliste/theme-06.json'
import genT07 from '../../data/amf/generaliste/theme-07.json'
import genT08 from '../../data/amf/generaliste/theme-08.json'
import genT09 from '../../data/amf/generaliste/theme-09.json'
import genT10 from '../../data/amf/generaliste/theme-10.json'
import genT11 from '../../data/amf/generaliste/theme-11.json'
import genT12 from '../../data/amf/generaliste/theme-12.json'

// ─── Imports statiques AMF Finance durable ───────────────────────────────────
import durT01 from '../../data/amf/durable/theme-01.json'
import durT02 from '../../data/amf/durable/theme-02.json'
import durT03 from '../../data/amf/durable/theme-03.json'
import durT04 from '../../data/amf/durable/theme-04.json'
import durT05 from '../../data/amf/durable/theme-05.json'

// ─── Catalogues ───────────────────────────────────────────────────────────────

const AMF_GEN_THEMES = [
  genT01, genT02, genT03, genT04, genT05,
  genT06, genT07, genT08, genT09, genT10,
  genT11, genT12,
] as unknown as AmfThemeFile[]

const AMF_DUR_THEMES = [
  durT01, durT02, durT03, durT04, durT05,
] as unknown as AmfThemeFile[]

export const ALL_AMF_THEMES: AmfThemeFile[] = [
  ...AMF_GEN_THEMES,
  ...AMF_DUR_THEMES,
]

// ─── Modules (fiches de cours) ────────────────────────────────────────────────

export const ALL_AMF_MODULES: AmfModule[] = ALL_AMF_THEMES.map(
  (t) => t.module
)

export function getAmfModuleById(id: string): AmfModule | undefined {
  return ALL_AMF_MODULES.find((m) => m.id === id)
}

export function getAmfModulesByExam(exam: AmfExam): AmfModule[] {
  return ALL_AMF_MODULES.filter((m) => m.exam === exam)
}

export function getAmfThemeFile(exam: AmfExam, themeId: number): AmfThemeFile | undefined {
  return ALL_AMF_THEMES.find((t) => t.exam === exam && t.theme_id === themeId)
}

// ─── Questions (banque locale — uniquement pour le seed et les quiz d'entraînement) ──

export const ALL_AMF_QUESTIONS_LOCAL: AmfQuestion[] = ALL_AMF_THEMES.flatMap(
  (t) => t.questions as AmfQuestion[]
)

export function getLocalQuestionsByTheme(exam: AmfExam, themeId: number): AmfQuestion[] {
  return ALL_AMF_QUESTIONS_LOCAL.filter(
    (q) => q.exam === exam && q.theme_id === themeId
  )
}

// ─── Descriptions des parcours AMF ────────────────────────────────────────────

export const AMF_PARCOURS = [
  {
    id: 'amf-generaliste',
    label: 'Certification AMF Généraliste',
    description:
      'Préparez l\'examen AMF obligatoire pour les fonctions de vendeur au sein d\'un PSI. 12 modules couvrant le cadre réglementaire, la déontologie, les instruments financiers et les marchés.',
    icon: '🏛️',
    color: '#F5D000',
    exam: 'generaliste' as AmfExam,
    moduleIds: AMF_GEN_THEMES.map((t) => t.module.id),
    targetAudience: 'Vendeurs PSI, conseillers en investissement',
    estimatedHours: 36,
    level: 'Intermédiaire' as const,
    totalQuestions: 120,
    passThreshold: '≥ 80 % en catégorie A ET ≥ 80 % en catégorie C',
  },
  {
    id: 'amf-durable',
    label: 'Certification AMF Finance Durable',
    description:
      'Préparez l\'examen AMF Finance durable optionnel. 5 modules sur la finance durable, la réglementation ESG (SFDR, Taxonomie) et la commercialisation des produits durables.',
    icon: '🌿',
    color: '#5CE37C',
    exam: 'durable' as AmfExam,
    moduleIds: AMF_DUR_THEMES.map((t) => t.module.id),
    targetAudience: 'Conseillers souhaitant la certification Finance durable',
    estimatedHours: 15,
    level: 'Intermédiaire' as const,
    totalQuestions: 60,
    passThreshold: '≥ 80 % global',
  },
] as const
