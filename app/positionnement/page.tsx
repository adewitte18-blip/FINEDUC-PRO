'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Target, ChevronRight, RotateCcw, TrendingUp } from 'lucide-react'
import { POSITIONNEMENT_QUESTIONS, PARCOURS_LIST, getDomainIcon } from '@/lib/content'
import { savePositionnement, getUser } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Step = 'intro' | 'quiz' | 'result'

export default function PositionnementPage() {
  const [step, setStep] = useState<Step>('intro')
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(POSITIONNEMENT_QUESTIONS.length).fill(null)
  )
  const [selected, setSelected] = useState<number | null>(null)
  const [showExplication, setShowExplication] = useState(false)
  const [domainScores, setDomainScores] = useState<Record<string, { correct: number; total: number }>>({})

  const current = POSITIONNEMENT_QUESTIONS[currentIdx]
  const totalQuestions = POSITIONNEMENT_QUESTIONS.length

  const handleSelect = (idx: number) => {
    if (selected !== null) return
    setSelected(idx)
    setShowExplication(true)

    const newAnswers = [...answers]
    newAnswers[currentIdx] = idx
    setAnswers(newAnswers)

    // Mise à jour du score par domaine
    const domain = current.domain
    const isCorrect = idx === current.reponse_correcte
    setDomainScores((prev) => ({
      ...prev,
      [domain]: {
        correct: (prev[domain]?.correct || 0) + (isCorrect ? 1 : 0),
        total: (prev[domain]?.total || 0) + 1,
      },
    }))
  }

  const handleNext = async () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
      setShowExplication(false)
    } else {
      // Calcul des résultats et recommandation
      const scores: Record<string, number> = {}
      for (const [domain, { correct, total }] of Object.entries(domainScores)) {
        scores[domain] = Math.round((correct / total) * 100)
      }
      const totalScore = Math.round(
        Object.values(scores).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(scores).length)
      )

      // Recommandation
      let recommendedParcours = 'fondamentaux'
      if (totalScore >= 70) recommendedParcours = 'expert-complet'
      else if (totalScore >= 50) recommendedParcours = 'comite'
      else if (scores['Financement sectoriel'] < 40) recommendedParcours = 'secteurs'
      else if (scores['Finance traditionnelle'] < 40) recommendedParcours = 'fondamentaux'

      const result = {
        user_id: '',
        taken_at: new Date().toISOString(),
        scores,
        recommended_parcours: recommendedParcours,
        total_score: totalScore,
      }

      getUser().then((u) => {
        if (u) result.user_id = u.id
        savePositionnement(result)
      })

      setStep('result')
    }
  }

  const handleRestart = () => {
    setStep('intro')
    setCurrentIdx(0)
    setAnswers(Array(POSITIONNEMENT_QUESTIONS.length).fill(null))
    setSelected(null)
    setShowExplication(false)
    setDomainScores({})
  }

  // ─── Calcul résultats pour l'affichage ───
  const finalScores: Record<string, number> = {}
  for (const [domain, { correct, total }] of Object.entries(domainScores)) {
    finalScores[domain] = Math.round((correct / total) * 100)
  }
  const totalScore = Math.round(
    Object.values(finalScores).reduce((a, b) => a + b, 0) / Math.max(1, Object.keys(finalScores).length)
  )
  const recommendedParcours = (() => {
    if (totalScore >= 70) return 'expert-complet'
    if (totalScore >= 50) return 'comite'
    if ((finalScores['Financement sectoriel'] || 100) < 40) return 'secteurs'
    if ((finalScores['Finance traditionnelle'] || 100) < 40) return 'fondamentaux'
    return 'fondamentaux'
  })()
  const recommended = PARCOURS_LIST.find((p) => p.id === recommendedParcours)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {step === 'intro' && (
        <div className="space-y-6 animate-in">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target size={28} className="text-brand-brown" />
            </div>
            <h1 className="text-3xl font-black text-brand-brown mb-3">
              Test de positionnement
            </h1>
            <p className="text-brand-brown-lighter max-w-md mx-auto">
              {totalQuestions} questions couvrant tous les domaines. Résultat instantané
              avec recommandation de parcours personnalisée.
            </p>
          </div>

          <div className="card p-6 space-y-3">
            {[
              { label: 'Durée estimée', value: '5-8 minutes' },
              { label: 'Questions', value: `${totalQuestions} questions multi-domaines` },
              { label: 'Résultat', value: 'Scoring par domaine + parcours recommandé' },
              { label: 'Adaptation', value: 'Aucune préparation requise — évaluez votre niveau réel' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-brand-brown-lighter">{label}</span>
                <span className="text-sm font-medium text-brand-brown">{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setStep('quiz')}
            className="btn-primary w-full justify-center py-4 text-base"
          >
            <Target size={20} />
            Démarrer le test
          </button>
        </div>
      )}

      {step === 'quiz' && (
        <div className="space-y-4 animate-in">
          {/* Progression */}
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 progress-bar">
              <div className="progress-fill" style={{ width: `${(currentIdx / totalQuestions) * 100}%` }} />
            </div>
            <span className="text-sm font-medium text-brand-brown-lighter whitespace-nowrap">
              {currentIdx + 1} / {totalQuestions}
            </span>
          </div>

          {/* Domain label */}
          <div className="flex items-center gap-2">
            <span className="text-lg">{getDomainIcon(current.domain)}</span>
            <span className="text-xs font-medium text-brand-brown-lighter uppercase tracking-wider">
              {current.domain}
            </span>
          </div>

          {/* Question */}
          <div className="card p-6">
            <h3 className="font-semibold text-brand-brown leading-relaxed mb-5">
              {current.question}
            </h3>

            <div className="space-y-3">
              {current.options.map((option, idx) => {
                const isSelected = selected === idx
                const isRight = idx === current.reponse_correcte
                let cls = 'border border-gray-200 hover:border-brand-yellow hover:bg-brand-yellow-light cursor-pointer'
                if (selected !== null) {
                  if (isRight) cls = 'border-2 border-brand-green bg-green-50'
                  else if (isSelected) cls = 'border-2 border-red-300 bg-red-50'
                  else cls = 'border border-gray-100 opacity-60 cursor-default'
                }
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={cn('w-full text-left p-4 rounded-xl transition-all flex items-start gap-3', cls)}
                  >
                    <div className={cn(
                      'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold',
                      selected !== null && isRight ? 'bg-brand-green border-brand-green text-white' :
                      selected !== null && isSelected ? 'bg-red-400 border-red-400 text-white' :
                      'border-gray-300 text-gray-400'
                    )}>
                      {selected !== null && isRight ? '✓' : selected !== null && isSelected ? '✗' : String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-sm text-brand-brown leading-relaxed">{option}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {showExplication && (
            <div className={cn(
              'card p-4 border-l-4 animate-in text-sm',
              selected === current.reponse_correcte
                ? 'border-brand-green bg-green-50'
                : 'border-orange-400 bg-orange-50'
            )}>
              <p className="text-brand-brown-light leading-relaxed">{current.explication}</p>
            </div>
          )}

          {selected !== null && (
            <button onClick={handleNext} className="btn-primary w-full justify-center animate-in">
              {currentIdx < totalQuestions - 1 ? (
                <>Question suivante <ChevronRight size={18} /></>
              ) : (
                <>Voir mes résultats <TrendingUp size={18} /></>
              )}
            </button>
          )}
        </div>
      )}

      {step === 'result' && (
        <div className="space-y-6 animate-in">
          <div className="text-center">
            <div className="text-6xl mb-3">
              {totalScore >= 70 ? '🏆' : totalScore >= 50 ? '📈' : totalScore >= 30 ? '📚' : '💪'}
            </div>
            <h2 className="text-3xl font-black text-brand-brown mb-1">{totalScore}%</h2>
            <p className="text-brand-brown-lighter">Score global de positionnement</p>
          </div>

          {/* Scores par domaine */}
          <div className="card p-6">
            <h3 className="font-bold text-brand-brown mb-4">Scores par domaine</h3>
            <div className="space-y-3">
              {Object.entries(finalScores).map(([domain, score]) => (
                <div key={domain}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-brand-brown flex items-center gap-1.5">
                      {getDomainIcon(domain)} {domain}
                    </span>
                    <span className={cn(
                      'text-sm font-bold',
                      score >= 70 ? 'text-brand-green' :
                      score >= 40 ? 'text-yellow-600' : 'text-red-500'
                    )}>
                      {score}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className={cn('h-full rounded-full transition-all', score >= 70 ? 'bg-brand-green' : score >= 40 ? 'bg-brand-yellow' : 'bg-red-400')}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommandation */}
          {recommended && (
            <div className="card p-6 border-l-4" style={{ borderLeftColor: recommended.color }}>
              <h3 className="font-bold text-brand-brown mb-1">Parcours recommandé</h3>
              <p className="text-sm text-brand-brown-lighter mb-3">
                Basé sur votre profil, nous vous recommandons :
              </p>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{recommended.icon}</span>
                <div>
                  <div className="font-bold text-brand-brown">{recommended.label}</div>
                  <div className="text-sm text-brand-brown-lighter mb-3">{recommended.description}</div>
                  <Link
                    href={`/parcours#${recommended.id}`}
                    className="btn-primary text-sm"
                  >
                    Démarrer ce parcours <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={handleRestart} className="btn-secondary flex-1">
              <RotateCcw size={16} />
              Refaire le test
            </button>
            <Link href="/parcours" className="btn-primary flex-1 justify-center">
              Tous les parcours <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
