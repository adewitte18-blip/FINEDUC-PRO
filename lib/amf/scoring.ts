import type {
  AmfQuestion,
  AmfAttemptAnswer,
  AmfExamConfig,
  AmfScoreResult,
} from './types'

/**
 * Calcule les scores A, C et global pour une tentative terminée.
 * Respecte la règle : pas de compensation entre les blocs A et C.
 */
export function computeAmfScore(
  questions: AmfQuestion[],
  answers: AmfAttemptAnswer[],
  config: AmfExamConfig
): AmfScoreResult {
  const byTheme: Record<number, { correct: number; total: number; score: number }> = {}

  let correctA = 0
  let totalA = 0
  let correctC = 0
  let totalC = 0

  for (const question of questions) {
    const answer = answers.find((a) => a.question_id === question.id)
    const isCorrect = answer?.is_correct ?? false

    // Agrégation par thème
    if (!byTheme[question.theme_id]) {
      byTheme[question.theme_id] = { correct: 0, total: 0, score: 0 }
    }
    byTheme[question.theme_id].total++
    if (isCorrect) byTheme[question.theme_id].correct++

    // Agrégation par catégorie
    if (question.category === 'A') {
      totalA++
      if (isCorrect) correctA++
    } else {
      totalC++
      if (isCorrect) correctC++
    }
  }

  // Calculer les scores par thème
  for (const t of Object.values(byTheme)) {
    t.score = t.total > 0 ? Math.round((t.correct / t.total) * 100) : 0
  }

  const scoreA = totalA > 0 ? Math.round((correctA / totalA) * 100) : 100
  const scoreC = totalC > 0 ? Math.round((correctC / totalC) * 100) : 100
  const total = questions.length
  const correctTotal = answers.filter((a) => a.is_correct).length
  const scoreGlobal = total > 0 ? Math.round((correctTotal / total) * 100) : 0

  // Règle de réussite
  let passed: boolean
  if (config.exam === 'generaliste') {
    // Pas de compensation : A et C doivent chacun atteindre le seuil
    passed =
      scoreA >= config.pass_threshold_a &&
      scoreC >= config.pass_threshold_c
  } else {
    // Finance durable : seuil global uniquement
    passed = scoreGlobal >= config.pass_threshold_a
  }

  return {
    score_global: scoreGlobal,
    score_a: scoreA,
    score_c: scoreC,
    correct_a: correctA,
    total_a: totalA,
    correct_c: correctC,
    total_c: totalC,
    passed,
    by_theme: byTheme,
  }
}

// ─────────────────────────────────────────────
//  Tests unitaires (mode dev, pas de dépendance Jest)
// ─────────────────────────────────────────────

/**
 * Vérifie les cas limites décrits dans le cahier des charges.
 * Appelée uniquement en environnement de développement.
 */
export function runScoringTests(): void {
  if (process.env.NODE_ENV !== 'development') return

  const genConfig = {
    exam: 'generaliste' as const,
    total_questions: 120,
    count_a: null,
    count_c: null,
    pass_threshold_a: 80,
    pass_threshold_c: 80,
    duration_minutes: 120,
  }

  const durConfig = {
    exam: 'durable' as const,
    total_questions: 60,
    count_a: null,
    count_c: null,
    pass_threshold_a: 80,
    pass_threshold_c: 80,
    duration_minutes: 60,
  }

  // Helper : créer questions et réponses fictives
  function makeQuestions(nA: number, nC: number): AmfQuestion[] {
    const qs: AmfQuestion[] = []
    for (let i = 0; i < nA; i++) {
      qs.push({ id: `a${i}`, exam: 'generaliste', theme_id: 1, category: 'A', difficulty: 1, question: '', options: ['', '', '', ''], correct_index: 0, explication: '', source: '', status: 'validated', version: 1 })
    }
    for (let i = 0; i < nC; i++) {
      qs.push({ id: `c${i}`, exam: 'generaliste', theme_id: 2, category: 'C', difficulty: 1, question: '', options: ['', '', '', ''], correct_index: 0, explication: '', source: '', status: 'validated', version: 1 })
    }
    return qs
  }

  function makeAnswers(questions: AmfQuestion[], correctA: number, correctC: number): AmfAttemptAnswer[] {
    const answers: AmfAttemptAnswer[] = []
    let cntA = 0
    let cntC = 0
    questions.forEach((q, i) => {
      const correct = q.category === 'A' ? cntA++ < correctA : cntC++ < correctC
      answers.push({ attempt_id: 'test', question_id: q.id, position: i, selected_index: 0, is_correct: correct })
    })
    return answers
  }

  // Cas 1 : 100 % A, 79 % C → ÉCHEC (règle sans compensation)
  const qs1 = makeQuestions(60, 60)
  const ans1 = makeAnswers(qs1, 60, 47) // 60/60 A, 47/60 C (~78 %)
  const r1 = computeAmfScore(qs1, ans1, genConfig)
  console.assert(!r1.passed, 'FAIL: 100% A + 78% C doit être un échec')

  // Cas 2 : 80 % A, 80 % C → RÉUSSITE
  const qs2 = makeQuestions(60, 60)
  const ans2 = makeAnswers(qs2, 48, 48) // 48/60 = 80 %
  const r2 = computeAmfScore(qs2, ans2, genConfig)
  console.assert(r2.passed, 'FAIL: 80% A + 80% C doit être une réussite')

  // Cas 3 : Finance durable 48/60 → RÉUSSITE
  const qs3: AmfQuestion[] = Array.from({ length: 60 }, (_, i) => ({
    id: `d${i}`, exam: 'durable' as const, theme_id: 1, category: 'C' as const,
    difficulty: 1 as const, question: '', options: ['', '', '', ''] as [string, string, string, string],
    correct_index: 0, explication: '', source: '', status: 'validated' as const, version: 1,
  }))
  const ans3 = qs3.map((q, i) => ({
    attempt_id: 'test', question_id: q.id, position: i,
    selected_index: 0, is_correct: i < 48,
  }))
  const r3 = computeAmfScore(qs3, ans3, durConfig)
  console.assert(r3.passed, 'FAIL: Finance durable 48/60 doit être une réussite')

  // Cas 4 : Finance durable 47/60 → ÉCHEC
  const ans4 = qs3.map((q, i) => ({
    attempt_id: 'test', question_id: q.id, position: i,
    selected_index: 0, is_correct: i < 47,
  }))
  const r4 = computeAmfScore(qs3, ans4, durConfig)
  console.assert(!r4.passed, 'FAIL: Finance durable 47/60 doit être un échec')

  console.log('✅ Scoring AMF : tous les tests passent')
}
