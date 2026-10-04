'use client'

import { useState, useEffect, useCallback } from 'react'
import { Clock, ChevronLeft, ChevronRight, Flag, AlertTriangle } from 'lucide-react'
import type { AmfQuestion, AmfExamConfig } from '@/lib/amf/types'
import { cn } from '@/lib/utils'

interface Props {
  questions: AmfQuestion[]
  config: AmfExamConfig
  onSubmit: (answers: (number | null)[]) => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function AmfExamEngine({ questions, config, onSubmit }: Props) {
  const totalSeconds = (config.duration_minutes ?? 120) * 60
  const [timeLeft, setTimeLeft] = useState(totalSeconds)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [showConfirm, setShowConfirm] = useState(false)

  const handleSubmit = useCallback(() => {
    onSubmit(answers)
  }, [answers, onSubmit])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft, handleSubmit])

  const isLowTime = timeLeft <= 300 // 5 minutes

  const handleSelect = (idx: number) => {
    const newAnswers = [...answers]
    newAnswers[currentIdx] = idx
    setAnswers(newAnswers)
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const current = questions[currentIdx]

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Header : timer + progression */}
      <div className="sticky top-16 z-10 bg-white border-b border-gray-100 pb-3 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-brand-brown-lighter">
              {answeredCount}/{questions.length} répondues
            </span>
          </div>
          <div className={cn(
            'flex items-center gap-1.5 font-mono font-bold text-lg px-3 py-1 rounded-xl',
            isLowTime ? 'bg-red-50 text-red-600' : 'bg-brand-off-white text-brand-brown'
          )}>
            <Clock size={16} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Grille de navigation */}
        <div className="flex flex-wrap gap-1">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIdx(i)}
              className={cn(
                'w-7 h-7 text-xs font-medium rounded-lg transition-all',
                i === currentIdx
                  ? 'bg-brand-brown text-white'
                  : answers[i] !== null
                  ? 'bg-brand-yellow text-brand-brown'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              )}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-yellow/20 text-brand-brown">
            Question {currentIdx + 1}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
            Catégorie {current.category}
          </span>
          <span className="text-xs text-brand-brown-lighter ml-auto">
            Thème {current.theme_id}
          </span>
        </div>

        <h3 className="font-semibold text-brand-brown leading-relaxed mb-6 text-base">
          {current.question}
        </h3>

        <div className="space-y-3">
          {current.options.map((option, idx) => {
            const isSelected = answers[currentIdx] === idx
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn(
                  'w-full text-left p-4 rounded-xl transition-all duration-150 flex items-start gap-3 border',
                  isSelected
                    ? 'border-2 border-brand-brown bg-brand-brown/5'
                    : 'border-gray-200 bg-white hover:border-brand-yellow hover:bg-brand-yellow-light'
                )}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold',
                  isSelected ? 'bg-brand-brown border-brand-brown text-white' : 'border-gray-300 text-gray-400'
                )}>
                  {isSelected ? '●' : String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm text-brand-brown leading-relaxed">{option}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="btn-secondary disabled:opacity-40"
        >
          <ChevronLeft size={16} />Précédente
        </button>

        {currentIdx < questions.length - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
            className="btn-primary"
          >
            Suivante<ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="btn-primary bg-brand-green hover:bg-brand-green-dark"
          >
            <Flag size={16} />Terminer l'examen
          </button>
        )}
      </div>

      {answeredCount < questions.length && currentIdx === questions.length - 1 && (
        <p className="text-center text-sm text-orange-500 mt-3 flex items-center justify-center gap-1.5">
          <AlertTriangle size={14} />
          {questions.length - answeredCount} question{questions.length - answeredCount > 1 ? 's' : ''} sans réponse
        </p>
      )}

      {/* Bouton terminer flottant (hors dernière question) */}
      {currentIdx < questions.length - 1 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-brand-brown-lighter hover:text-brand-brown underline"
          >
            Terminer l'examen maintenant
          </button>
        </div>
      )}

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-brand-brown text-lg mb-2">Terminer l'examen ?</h3>
            <p className="text-brand-brown-lighter text-sm mb-1">
              {answeredCount} / {questions.length} questions répondues.
            </p>
            {answeredCount < questions.length && (
              <p className="text-orange-500 text-sm mb-4 flex items-center gap-1.5">
                <AlertTriangle size={14} />
                {questions.length - answeredCount} question{questions.length - answeredCount > 1 ? 's' : ''} sans réponse seront comptées comme incorrectes.
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowConfirm(false)} className="btn-secondary flex-1">
                Continuer
              </button>
              <button onClick={handleSubmit} className="btn-primary flex-1 bg-brand-green hover:bg-brand-green-dark">
                <Flag size={16} />Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
