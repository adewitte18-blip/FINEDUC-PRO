'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Clock, ClipboardList, AlertTriangle, Play } from 'lucide-react'
import { DEFAULT_CONFIG_GENERALISTE, DEFAULT_CONFIG_DURABLE } from '@/lib/amf/types'
import { ALL_AMF_QUESTIONS_LOCAL } from '@/lib/amf/content'
import { drawExamQuestions, shuffleOptions } from '@/lib/amf/exam-engine'
import { getUser } from '@/lib/supabase'
import { createAttempt } from '@/lib/amf/supabase'
import type { AmfExam } from '@/lib/amf/types'

function ExamenConfigContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const examParam = searchParams.get('exam') as AmfExam | null
  const exam: AmfExam = examParam === 'durable' ? 'durable' : 'generaliste'

  const config = exam === 'durable' ? DEFAULT_CONFIG_DURABLE : DEFAULT_CONFIG_GENERALISTE
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const allQuestions = ALL_AMF_QUESTIONS_LOCAL.filter((q) => q.exam === exam)

  const handleStart = async () => {
    setLoading(true)
    setError(null)
    try {
      const drawn = drawExamQuestions(allQuestions, config, new Set(), [])
      if (drawn.length === 0) {
        setError('Aucune question disponible. Vérifiez que les questions sont bien chargées.')
        setLoading(false)
        return
      }
      const shuffled = drawn.map(shuffleOptions)

      const user = await getUser()
      const userId = user?.id ?? 'anonymous'

      let attemptId: string
      try {
        attemptId = await createAttempt({
          user_id: userId,
          exam,
          status: 'in_progress',
          started_at: new Date().toISOString(),
          config_snapshot: config,
          question_ids: shuffled.map((q) => q.id),
        })
      } catch {
        attemptId = `local-${Date.now()}`
      }

      // Stocker les questions dans sessionStorage
      try {
        sessionStorage.setItem(
          `amf-exam-${attemptId}`,
          JSON.stringify({ questions: shuffled, config, exam })
        )
      } catch {}

      router.push(`/amf/examen/${attemptId}`)
    } catch (e) {
      setError('Erreur lors du démarrage. Réessayez.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/amf" className="inline-flex items-center gap-1.5 text-brand-brown-lighter hover:text-brand-brown text-sm mb-6 transition-colors">
        <ChevronLeft size={16} />Retour AMF
      </Link>

      <div className="card p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">{exam === 'durable' ? '🌿' : '🏛️'}</div>
          <h1 className="text-2xl font-black text-brand-brown mb-2">
            Examen blanc — AMF {exam === 'durable' ? 'Finance Durable' : 'Généraliste'}
          </h1>
          <p className="text-brand-brown-lighter text-sm">Simulation en conditions réelles</p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-off-white rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-brand-brown">{config.total_questions}</div>
            <div className="text-xs text-brand-brown-lighter mt-1">Questions</div>
          </div>
          <div className="bg-brand-off-white rounded-xl p-4 text-center">
            <div className="text-2xl font-black text-brand-brown flex items-center justify-center gap-1">
              <Clock size={20} />{config.duration_minutes}
            </div>
            <div className="text-xs text-brand-brown-lighter mt-1">Minutes</div>
          </div>
        </div>

        <div className="card p-4 bg-brand-off-white mb-6">
          <h3 className="font-semibold text-brand-brown text-sm mb-2 flex items-center gap-2">
            <ClipboardList size={15} />Règle de réussite
          </h3>
          {exam === 'generaliste' ? (
            <ul className="text-sm text-brand-brown-lighter space-y-1">
              <li>✓ Obtenir <strong className="text-brand-brown">≥ 80 %</strong> en catégorie A (déontologie)</li>
              <li>✓ ET obtenir <strong className="text-brand-brown">≥ 80 %</strong> en catégorie C (technique)</li>
              <li className="text-xs mt-2 text-orange-500">⚠️ Pas de compensation entre les deux blocs</li>
            </ul>
          ) : (
            <ul className="text-sm text-brand-brown-lighter space-y-1">
              <li>✓ Obtenir <strong className="text-brand-brown">≥ 80 %</strong> au score global</li>
            </ul>
          )}
        </div>

        <div className="card p-4 bg-amber-50 border border-amber-200 mb-6">
          <p className="text-sm text-amber-700 flex items-start gap-2">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>
              <strong>Mode démo</strong> — Les questions utilisées sont en cours de validation.
              Une fois validées, l'algorithme de tirage sélectionnera les questions selon votre historique.
            </span>
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm text-center mb-4">{error}</p>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="btn-primary w-full justify-center text-base py-4 disabled:opacity-60"
        >
          {loading ? (
            <span className="animate-pulse">Préparation de l'examen…</span>
          ) : (
            <><Play size={18} />Démarrer l'examen</>
          )}
        </button>

        <p className="text-center text-xs text-brand-brown-lighter mt-4">
          Une fois démarré, le chronomètre ne s'arrête pas.
        </p>
      </div>
    </div>
  )
}

export default function ExamenPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20 text-brand-brown-lighter">Chargement…</div>}>
      <ExamenConfigContent />
    </Suspense>
  )
}
