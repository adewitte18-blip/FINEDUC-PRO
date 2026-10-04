import { createSupabaseClient } from '../supabase'
import type {
  AmfQuestion,
  AmfExam,
  AmfExamAttempt,
  AmfAttemptAnswer,
  AmfUserQuestionStats,
} from './types'

// ─── Client Supabase (même pattern que lib/supabase.ts) ──────────────────────

function getSupabase() {
  return createSupabaseClient()
}

// ─── Questions ────────────────────────────────────────────────────────────────

/**
 * Récupère toutes les questions validées pour un examen donné.
 * Utilisé par le moteur de tirage.
 */
export async function fetchValidatedQuestions(exam: AmfExam): Promise<AmfQuestion[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('amf_questions')
    .select('*')
    .eq('exam', exam)
    .eq('status', 'validated')
    .order('theme_id', { ascending: true })

  if (error) throw new Error(`fetchValidatedQuestions: ${error.message}`)
  return (data ?? []) as AmfQuestion[]
}

/**
 * Récupère toutes les questions (draft inclus) — pour la vue de relecture.
 */
export async function fetchAllQuestions(exam: AmfExam): Promise<AmfQuestion[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('amf_questions')
    .select('*')
    .eq('exam', exam)
    .order('theme_id', { ascending: true })
    .order('id', { ascending: true })

  if (error) throw new Error(`fetchAllQuestions: ${error.message}`)
  return (data ?? []) as AmfQuestion[]
}

/**
 * Met à jour le statut d'une question (draft → validated ou inversement).
 */
export async function updateQuestionStatus(
  id: string,
  status: 'draft' | 'validated',
  patch?: Partial<Pick<AmfQuestion, 'question' | 'options' | 'correct_index' | 'explication' | 'source'>>
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('amf_questions')
    .update({ status, ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`updateQuestionStatus: ${error.message}`)
}

// ─── Tentatives ───────────────────────────────────────────────────────────────

export async function createAttempt(attempt: Omit<AmfExamAttempt, 'id'>): Promise<string> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('amf_exam_attempts')
    .insert(attempt)
    .select('id')
    .single()

  if (error) throw new Error(`createAttempt: ${error.message}`)
  return data.id as string
}

export async function updateAttempt(
  id: string,
  patch: Partial<AmfExamAttempt>
): Promise<void> {
  const supabase = getSupabase()
  const { error } = await supabase
    .from('amf_exam_attempts')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(`updateAttempt: ${error.message}`)
}

export async function fetchAttempt(id: string): Promise<AmfExamAttempt | null> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('amf_exam_attempts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as AmfExamAttempt
}

export async function fetchUserAttempts(
  userId: string,
  exam?: AmfExam
): Promise<AmfExamAttempt[]> {
  const supabase = getSupabase()
  let query = supabase
    .from('amf_exam_attempts')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('finished_at', { ascending: false })

  if (exam) query = query.eq('exam', exam)

  const { data, error } = await query
  if (error) throw new Error(`fetchUserAttempts: ${error.message}`)
  return (data ?? []) as AmfExamAttempt[]
}

// ─── Réponses ─────────────────────────────────────────────────────────────────

export async function saveAttemptAnswers(answers: Omit<AmfAttemptAnswer, 'id'>[]): Promise<void> {
  if (answers.length === 0) return
  const supabase = getSupabase()
  const { error } = await supabase.from('amf_attempt_answers').insert(answers)
  if (error) throw new Error(`saveAttemptAnswers: ${error.message}`)
}

export async function fetchAttemptAnswers(attemptId: string): Promise<AmfAttemptAnswer[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('amf_attempt_answers')
    .select('*')
    .eq('attempt_id', attemptId)
    .order('position', { ascending: true })

  if (error) throw new Error(`fetchAttemptAnswers: ${error.message}`)
  return (data ?? []) as AmfAttemptAnswer[]
}

// ─── Statistiques par question ────────────────────────────────────────────────

/**
 * Met à jour les statistiques après une tentative terminée (upsert).
 */
export async function upsertQuestionStats(
  userId: string,
  answers: AmfAttemptAnswer[]
): Promise<void> {
  if (answers.length === 0) return
  const supabase = getSupabase()
  const now = new Date().toISOString()

  const upserts = answers.map((a) => ({
    user_id: userId,
    question_id: a.question_id,
    times_seen: 1,
    times_wrong: a.is_correct ? 0 : 1,
    last_seen_at: now,
  }))

  const { error } = await supabase.rpc('upsert_amf_question_stats', {
    stats: upserts,
  })

  // Fallback si la fonction RPC n'existe pas encore : upsert direct
  if (error) {
    for (const u of upserts) {
      await supabase.from('amf_user_question_stats').upsert(
        {
          ...u,
          updated_at: now,
        },
        {
          onConflict: 'user_id,question_id',
          ignoreDuplicates: false,
        }
      )
    }
  }
}

export async function fetchUserQuestionStats(
  userId: string,
  exam: AmfExam
): Promise<AmfUserQuestionStats[]> {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('amf_user_question_stats')
    .select('*, amf_questions!inner(exam)')
    .eq('user_id', userId)
    .eq('amf_questions.exam', exam)

  if (error) throw new Error(`fetchUserQuestionStats: ${error.message}`)
  return (data ?? []) as AmfUserQuestionStats[]
}

/**
 * Retourne les IDs de questions déjà vues par l'utilisateur pour un examen.
 */
export async function fetchSeenQuestionIds(
  userId: string,
  exam: AmfExam
): Promise<Set<string>> {
  const stats = await fetchUserQuestionStats(userId, exam)
  return new Set(stats.map((s) => s.question_id))
}
