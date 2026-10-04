'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import AmfExamEngine from '@/components/amf/AmfExamEngine'
import AmfExamResults from '@/components/amf/AmfExamResults'
import { computeAmfScore } from '@/lib/amf/scoring'
import { updateAttempt, saveAttemptAnswers } from '@/lib/amf/supabase'
import { getUser } from '@/lib/supabase'
import type { AmfQuestion, AmfExamConfig, AmfExam, AmfScoreResult } from '@/lib/amf/types'

interface Props {
  params: { attemptId: string }
}

interface ExamSession {
  questions: AmfQuestion[]
  config: AmfExamConfig
  exam: AmfExam
}

export default function ExamenActivePage({ params }: Props) {
  const { attemptId } = params
  const router = useRouter()

  const [session, setSession] = useState<ExamSession | null>(null)
  const [result, setResult] = useState<AmfScoreResult | null>(null)
  const [finalAnswers, setFinalAnswers] = useState<(number | null)[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`amf-exam-${attemptId}`)
      if (raw) {
        setSession(JSON.parse(raw))
      } else {
        setError("Session introuvable. Veuillez relancer l'examen.")
      }
    } catch {
      setError("Impossible de charger la session d'examen.")
    }
    setLoading(false)
  }, [attemptId])

  const handleSubmit = async (answers: (number | null)[]) => {
    if (!session) return
    const { questions, config, exam } = session

    const scoreResult = computeAmfScore(
      questions,
      answers.map((selected, i) => ({
        attempt_id: attemptId,
        question_id: questions[i].id,
        position: i,
        selected_index: selected,
        is_correct: selected === questions[i].correct_index,
      })),
      config
    )

    setFinalAnswers(answers)
    setResult(scoreResult)

    // Sauvegarder dans Supabase (best-effort)
    if (!attemptId.startsWith('local-')) {
      try {
        const user = await getUser()
        await updateAttempt(attemptId, {
          status: 'completed',
          finished_at: new Date().toISOString(),
          score_global: scoreResult.score_global,
          score_a: scoreResult.score_a,
          score_c: scoreResult.score_c,
          passed: scoreResult.passed,
        })
        await saveAttemptAnswers(
          answers.map((selected, i) => ({
            attempt_id: attemptId,
            question_id: questions[i].id,
            position: i,
            selected_index: selected,
            is_correct: selected === questions[i].correct_index,
          }))
        )
      } catch {}
    }

    // Stocker les résultats pour la page /resultats
    try {
      sessionStorage.setItem(
        `amf-result-${attemptId}`,
        JSON.stringify({ result: scoreResult, answers, exam: session.exam, questions })
      )
    } catch {}
  }

  const handleRetry = () => {
    try { sessionStorage.removeItem(`amf-exam-${attemptId}`) } catch {}
    router.push(`/amf/examen?exam=${session?.exam ?? 'generaliste'}`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-brand-brown-lighter">
        Chargement de l'examen…
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 mb-4">{error ?? "Session introuvable."}</p>
        <Link href="/amf/examen" className="btn-primary">Retour</Link>
      </div>
    )
  }

  if (result) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-black text-brand-brown mb-6">Résultats de l'examen</h1>
        <AmfExamResults
          exam={session.exam}
          questions={session.questions}
          answers={finalAnswers}
          result={result}
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-100 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="text-sm font-semibold text-brand-brown">
            AMF {session.exam === 'durable' ? 'Finance Durable' : 'Généraliste'} — Examen blanc
          </div>
        </div>
      </div>
      <AmfExamEngine
        questions={session.questions}
        config={session.config}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
