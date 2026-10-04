// ─────────────────────────────────────────────
//  AMF — Types de contenu (banque de questions)
// ─────────────────────────────────────────────

export type AmfExam = 'generaliste' | 'durable'
export type AmfCategory = 'A' | 'C'
export type AmfQuestionStatus = 'draft' | 'validated'
export type AmfDifficulty = 1 | 2 | 3

export interface AmfQuestion {
  id: string
  exam: AmfExam
  theme_id: number
  category: AmfCategory
  difficulty: AmfDifficulty
  question: string
  options: [string, string, string, string]
  correct_index: number   // 0-3
  explication: string
  source: string
  status: AmfQuestionStatus
  version: number
}

// ─────────────────────────────────────────────
//  AMF — Contenu des modules (cours + quiz entraînement)
// ─────────────────────────────────────────────

import type { Cours } from '../types'

export interface AmfModule {
  id: string            // ex: "amf-gen-t03"
  exam: AmfExam
  theme_id: number
  label: string
  category: AmfCategory | 'A+C'   // thèmes mixtes
  duration: string
  cours: Cours          // même structure que les modules existants
}

export interface AmfThemeFile {
  exam: AmfExam
  theme_id: number
  label: string
  category: AmfCategory | 'A+C'
  module: AmfModule
  questions: AmfQuestion[]
}

// ─────────────────────────────────────────────
//  AMF — Moteur d'examen
// ─────────────────────────────────────────────

export interface AmfExamConfig {
  exam: AmfExam
  total_questions: number
  // Répartition par catégorie (null = proportionnelle à la banque)
  count_a: number | null
  count_c: number | null
  // Seuil de réussite (0-100)
  pass_threshold_a: number
  pass_threshold_c: number
  // Durée en minutes (null = sans limite)
  duration_minutes: number | null
}

export const DEFAULT_CONFIG_GENERALISTE: AmfExamConfig = {
  exam: 'generaliste',
  total_questions: 120,
  count_a: null,
  count_c: null,
  pass_threshold_a: 80,
  pass_threshold_c: 80,
  duration_minutes: 120,
}

export const DEFAULT_CONFIG_DURABLE: AmfExamConfig = {
  exam: 'durable',
  total_questions: 60,
  count_a: null,
  count_c: null,
  pass_threshold_a: 80,
  pass_threshold_c: 80,
  duration_minutes: 60,
}

// ─────────────────────────────────────────────
//  AMF — Tentatives (miroir des tables Supabase)
// ─────────────────────────────────────────────

export type AmfAttemptStatus = 'in_progress' | 'completed' | 'abandoned'

export interface AmfExamAttempt {
  id?: string
  user_id: string
  exam: AmfExam
  status: AmfAttemptStatus
  started_at: string
  finished_at?: string
  duration_s?: number
  score_global?: number   // 0-100
  score_a?: number        // 0-100
  score_c?: number        // 0-100
  passed?: boolean
  config_snapshot: AmfExamConfig
  question_ids: string[]  // ordre du tirage, pour revue
}

export interface AmfAttemptAnswer {
  id?: string
  attempt_id: string
  question_id: string
  position: number
  selected_index: number | null   // null = sans réponse
  is_correct: boolean
  answered_at?: string
}

export interface AmfUserQuestionStats {
  id?: string
  user_id: string
  question_id: string
  times_seen: number
  times_wrong: number
  last_seen_at: string
}

// ─────────────────────────────────────────────
//  AMF — Scoring
// ─────────────────────────────────────────────

export interface AmfScoreResult {
  score_global: number    // pourcentage 0-100
  score_a: number
  score_c: number
  correct_a: number
  total_a: number
  correct_c: number
  total_c: number
  passed: boolean
  by_theme: Record<number, { correct: number; total: number; score: number }>
}
