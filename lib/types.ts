// ─────────────────────────────────────────────
//  Types de contenu (statique, depuis les JSON)
// ─────────────────────────────────────────────

export interface Section {
  titre: string
  contenu: string
}

export interface Cours {
  introduction: string
  sections: Section[]
  points_cles: string[]
}

export interface QuizQuestion {
  question: string
  options: string[]
  reponse_correcte: number
  explication: string
}

export interface CasPratique {
  titre: string
  contexte: string
  donnees_financieres?: Record<string, unknown>
  questions?: string[]
  elements_de_reponse?: Record<string, unknown>
  correction?: Record<string, unknown>
}

export interface Flashcard {
  id: string
  moduleId: string
  recto: string
  verso: string
  categorie?: string
}

export type ModuleLevel = 'Débutant' | 'Intermédiaire' | 'Avancé' | 'Expert'
export type ModuleDomain =
  | 'Finance traditionnelle'
  | 'Comptabilité & Performance'
  | 'Droit & Fiscal'
  | 'Financement sectoriel'
  | 'Marchés & DeFi'
  | 'Évaluation & Risques'
  | 'Soft skills'
  | string

export interface Module {
  id: string
  label: string
  tag: string
  level: ModuleLevel
  duration: string
  domain: ModuleDomain
  cours: Cours
  quiz: QuizQuestion[]
  cas_pratique?: CasPratique
}

// ─────────────────────────────────────────────
//  Parcours guidés
// ─────────────────────────────────────────────

export interface Parcours {
  id: string
  label: string
  description: string
  icon: string
  color: string
  moduleIds: string[]
  targetAudience: string
  estimatedHours: number
  level: ModuleLevel
}

// ─────────────────────────────────────────────
//  Types utilisateur / progression (Supabase)
// ─────────────────────────────────────────────

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface UserProgress {
  id?: string
  user_id: string
  module_id: string
  status: ProgressStatus
  quiz_score?: number       // score 0-100
  quiz_attempts?: number
  cours_completed?: boolean
  cas_completed?: boolean
  last_visited?: string     // ISO date
  completed_at?: string     // ISO date
}

export interface FlashcardReview {
  id?: string
  user_id: string
  flashcard_id: string
  module_id: string
  next_review?: string      // ISO date (spaced repetition)
  ease_factor?: number      // SRS ease factor
  interval_days?: number
  correct_streak?: number
}

export interface PositionnementResult {
  id?: string
  user_id: string
  taken_at: string
  scores: Record<string, number>   // domain -> score 0-100
  recommended_parcours: string
  total_score: number
}

export interface Binome {
  id?: string
  user1_id: string
  user2_id: string
  created_at?: string
  status: 'pending' | 'active' | 'inactive'
  shared_parcours?: string
}

export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  job_title?: string
  region?: string
  created_at?: string
  positioning_done?: boolean
  active_parcours?: string
}

// ─────────────────────────────────────────────
//  Types UI
// ─────────────────────────────────────────────

export interface QuizState {
  currentIndex: number
  answers: (number | null)[]
  showExplication: boolean
  completed: boolean
  score: number
}

export interface ComiteSession {
  moduleId: string
  questions: string[]
  timePerQuestion: number   // secondes
  currentIndex: number
  started: boolean
  finished: boolean
  notes: string[]
}
