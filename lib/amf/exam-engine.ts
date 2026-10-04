import type {
  AmfQuestion,
  AmfExamConfig,
  AmfUserQuestionStats,
} from './types'

/**
 * Algorithme de tirage stratifié pour les examens blancs AMF.
 *
 * Priorités :
 * 1. Questions non encore vues par l'utilisateur
 * 2. Si stock insuffisant : questions les plus souvent ratées
 * 3. En dernier recours : questions les plus anciennes (last_seen_at le plus vieux)
 *
 * Toujours : uniquement les questions `validated`.
 */
export function drawExamQuestions(
  allValidated: AmfQuestion[],
  config: AmfExamConfig,
  seenIds: Set<string>,
  userStats: AmfUserQuestionStats[]
): AmfQuestion[] {
  const statsMap = new Map(userStats.map((s) => [s.question_id, s]))

  // Séparer par catégorie
  const questionsA = allValidated.filter((q) => q.category === 'A')
  const questionsC = allValidated.filter((q) => q.category === 'C')

  // Calculer les quotas A et C
  const total = config.total_questions
  let countA: number
  let countC: number

  if (config.count_a !== null && config.count_c !== null) {
    countA = config.count_a
    countC = config.count_c
  } else {
    // Répartition proportionnelle à la banque disponible
    const totalBank = allValidated.length || 1
    countA = Math.round(total * (questionsA.length / totalBank))
    countC = total - countA
  }

  const drawnA = drawFromPool(questionsA, countA, seenIds, statsMap)
  const drawnC = drawFromPool(questionsC, countC, seenIds, statsMap)

  // Mélanger A et C ensemble, puis mélanger les options de chaque question
  const combined = shuffleArray([...drawnA, ...drawnC])
  return combined
}

/**
 * Pioche `count` questions depuis `pool`, en priorisant les non-vues.
 */
function drawFromPool(
  pool: AmfQuestion[],
  count: number,
  seenIds: Set<string>,
  statsMap: Map<string, AmfUserQuestionStats>
): AmfQuestion[] {
  const unseen = pool.filter((q) => !seenIds.has(q.id))
  const seen = pool.filter((q) => seenIds.has(q.id))

  // Trier les vues : les plus souvent ratées en premier, puis par ancienneté
  seen.sort((a, b) => {
    const sa = statsMap.get(a.id)
    const sb = statsMap.get(b.id)
    const wrongDiff = (sb?.times_wrong ?? 0) - (sa?.times_wrong ?? 0)
    if (wrongDiff !== 0) return wrongDiff
    const dateA = sa?.last_seen_at ?? '2000-01-01'
    const dateB = sb?.last_seen_at ?? '2000-01-01'
    return dateA < dateB ? -1 : 1 // les plus anciennes d'abord
  })

  const shuffledUnseen = shuffleArray(unseen)
  const ordered = [...shuffledUnseen, ...seen]

  return ordered.slice(0, count)
}

/**
 * Mélange un tableau (Fisher-Yates).
 */
export function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * Mélange les options d'une question et retourne la nouvelle version
 * avec le correct_index mis à jour.
 */
export function shuffleOptions(question: AmfQuestion): AmfQuestion {
  const indices = [0, 1, 2, 3]
  const shuffledIndices = shuffleArray(indices)
  const newOptions = shuffledIndices.map((i) => question.options[i]) as [string, string, string, string]
  const newCorrectIndex = shuffledIndices.indexOf(question.correct_index)
  return { ...question, options: newOptions, correct_index: newCorrectIndex }
}

/**
 * Vérifie qu'un tirage ne partage aucune question avec un ensemble de tentatives précédentes,
 * tant que la banque le permet.
 */
export function validateNoDuplicates(
  drawnIds: string[],
  previousAttemptQuestionIds: string[][]
): boolean {
  const drawn = new Set(drawnIds)
  for (const prev of previousAttemptQuestionIds) {
    for (const id of prev) {
      if (drawn.has(id)) return false
    }
  }
  return true
}
