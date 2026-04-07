import { createBrowserClient } from '@supabase/ssr'
import type { UserProgress, FlashcardReview, PositionnementResult, Binome, UserProfile } from './types'

// ─────────────────────────────────────────────
//  Client Supabase (côté navigateur)
// ─────────────────────────────────────────────

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// ─────────────────────────────────────────────
//  Clé localStorage pour mode hors-ligne
// ─────────────────────────────────────────────

const PROGRESS_KEY = 'fineduc_progress'
const FLASHCARD_KEY = 'fineduc_flashcards'

// ─────────────────────────────────────────────
//  Gestion de la progression (Supabase + localStorage fallback)
// ─────────────────────────────────────────────

export async function getUserProgress(userId: string): Promise<UserProgress[]> {
  if (!userId || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getLocalProgress()
  }
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data || []
  } catch {
    return getLocalProgress()
  }
}

export async function upsertProgress(progress: UserProgress): Promise<void> {
  // Toujours sauvegarder en local
  saveLocalProgress(progress)

  if (!progress.user_id || !process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = createSupabaseClient()
    await supabase.from('user_progress').upsert(progress, {
      onConflict: 'user_id,module_id',
    })
  } catch {
    // silently fail, local storage is the fallback
  }
}

function getLocalProgress(): UserProgress[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(PROGRESS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalProgress()
    const idx = existing.findIndex((p) => p.module_id === progress.module_id)
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...progress }
    } else {
      existing.push(progress)
    }
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(existing))
  } catch {}
}

// ─────────────────────────────────────────────
//  Flashcard reviews (SRS simplifié)
// ─────────────────────────────────────────────

export async function getFlashcardReviews(userId: string): Promise<FlashcardReview[]> {
  if (!userId || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return getLocalFlashcardReviews()
  }
  try {
    const supabase = createSupabaseClient()
    const { data, error } = await supabase
      .from('flashcard_reviews')
      .select('*')
      .eq('user_id', userId)
    if (error) throw error
    return data || []
  } catch {
    return getLocalFlashcardReviews()
  }
}

export async function upsertFlashcardReview(review: FlashcardReview): Promise<void> {
  saveLocalFlashcardReview(review)
  if (!review.user_id || !process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = createSupabaseClient()
    await supabase.from('flashcard_reviews').upsert(review, {
      onConflict: 'user_id,flashcard_id',
    })
  } catch {}
}

function getLocalFlashcardReviews(): FlashcardReview[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(FLASHCARD_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalFlashcardReview(review: FlashcardReview): void {
  if (typeof window === 'undefined') return
  try {
    const existing = getLocalFlashcardReviews()
    const idx = existing.findIndex((r) => r.flashcard_id === review.flashcard_id)
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...review }
    } else {
      existing.push(review)
    }
    localStorage.setItem(FLASHCARD_KEY, JSON.stringify(existing))
  } catch {}
}

// SRS : calcul du prochain intervalle (algo SM-2 simplifié)
export function computeNextReview(
  review: FlashcardReview,
  quality: 0 | 1 | 2 | 3 | 4 | 5  // 0-2 = mauvais, 3-5 = bon
): FlashcardReview {
  const ef = Math.max(1.3, (review.ease_factor || 2.5) + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)))
  let interval = review.interval_days || 1

  if (quality < 3) {
    interval = 1
  } else if (interval === 1) {
    interval = 6
  } else {
    interval = Math.round(interval * ef)
  }

  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + interval)

  return {
    ...review,
    ease_factor: ef,
    interval_days: interval,
    next_review: nextDate.toISOString(),
    correct_streak: quality >= 3 ? (review.correct_streak || 0) + 1 : 0,
  }
}

// ─────────────────────────────────────────────
//  Test de positionnement
// ─────────────────────────────────────────────

export async function savePositionnement(result: PositionnementResult): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.setItem('fineduc_positionnement', JSON.stringify(result))
  }
  if (!result.user_id || !process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = createSupabaseClient()
    await supabase.from('positionnement_results').insert(result)
  } catch {}
}

export function getLocalPositionnement(): PositionnementResult | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('fineduc_positionnement')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────
//  Authentification
// ─────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = createSupabaseClient()
  return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, fullName: string) {
  const supabase = createSupabaseClient()
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export async function signOut() {
  const supabase = createSupabaseClient()
  return supabase.auth.signOut()
}

export async function getUser() {
  const supabase = createSupabaseClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}

// ─────────────────────────────────────────────
//  Système de binômes
// ─────────────────────────────────────────────

export async function getBinome(userId: string): Promise<Binome | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from('binomes')
      .select('*')
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
      .eq('status', 'active')
      .single()
    return data
  } catch {
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null
  try {
    const supabase = createSupabaseClient()
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  } catch {
    return null
  }
}

export async function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return
  try {
    const supabase = createSupabaseClient()
    await supabase.from('profiles').upsert({ id: userId, ...updates })
  } catch {}
}
