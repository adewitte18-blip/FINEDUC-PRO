'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy } from 'lucide-react'
import type { AmfQuestion } from '@/lib/amf/types'
import { cn, scoreToGrade } from '@/lib/utils'

interface Props {
  questions: AmfQuestion[]
  themeLabel: string
  onComplete: (score: number) => void
}

export default function AmfQuizEngine({ questions, themeLabel, onComplete }: Props) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [showExplication, setShowExplication] = useState(false)
  const [finished, setFinished] = useState(false)

  const current = questions[currentIdx]
  const isAnswered = selected !== null
  const isCorrect = selected === current?.correct_index

  const correctCount = answers.filter((a, i) => a === questions[i]?.correct_index).length
  const score = Math.round((correctCount / questions.length) * 100)
  const { grade, color } = scoreToGrade(score)

  const handleSelect = (idx: number) => {
    if (isAnswered) return
    setSelected(idx)
    setShowExplication(true)
    const newAnswers = [...answers]
    newAnswers[currentIdx] = idx
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setSelected(null)
      setShowExplication(false)
    } else {
      setFinished(true)
      onComplete(score)
    }
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setSelected(null)
    setAnswers(Array(questions.length).fill(null))
    setShowExplication(false)
    setFinished(false)
  }

  if (finished) {
    return (
      <div className="card p-8 text-center animate-in">
        <div className="text-5xl mb-4">
          {score >= 80 ? '🏆' : score >= 60 ? '👍' : score >= 40 ? '📚' : '💪'}
        </div>
        <h3 className="text-2xl font-black text-brand-brown mb-1">{score}%</h3>
        <p className={cn('font-semibold text-lg mb-2', color)}>{grade}</p>
        <p className="text-brand-brown-lighter text-sm mb-6">
          {correctCount} bonne{correctCount > 1 ? 's' : ''} réponse{correctCount > 1 ? 's' : ''} sur {questions.length}
        </p>

        <div className="bg-brand-off-white rounded-xl p-4 mb-6 text-left space-y-2">
          {questions.map((q, i) => {
            const wasCorrect = answers[i] === q.correct_index
            return (
              <div key={i} className="flex items-start gap-2">
                {wasCorrect ? (
                  <CheckCircle2 size={16} className="text-brand-green shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                )}
                <span className="text-xs text-brand-brown-light line-clamp-1">{q.question}</span>
              </div>
            )
          })}
        </div>

        <div className="flex gap-3">
          <button onClick={handleRestart} className="btn-secondary flex-1">
            <RotateCcw size={16} />Recommencer
          </button>
          <button onClick={() => onComplete(score)} className="btn-primary flex-1">
            <Trophy size={16} />Terminer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-1 progress-bar">
          <div className="progress-fill" style={{ width: `${(currentIdx / questions.length) * 100}%` }} />
        </div>
        <span className="text-sm font-medium text-brand-brown-lighter whitespace-nowrap">
          {currentIdx + 1} / {questions.length}
        </span>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {questions.map((_, i) => (
          <div
            key={i}
            className={cn(
              'w-6 h-1.5 rounded-full transition-all',
              i < currentIdx
                ? answers[i] === questions[i].correct_index ? 'bg-brand-green' : 'bg-red-300'
                : i === currentIdx ? 'bg-brand-yellow' : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      <div className="card p-6 animate-in">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-yellow/20 text-brand-brown">
            Catégorie {current.category}
          </span>
          {current.source && (
            <span className="text-xs text-brand-brown-lighter">{current.source}</span>
          )}
        </div>
        <h3 className="font-semibold text-brand-brown leading-relaxed mb-5">{current.question}</h3>

        <div className="space-y-3">
          {current.options.map((option, idx) => {
            const isSelected = selected === idx
            const isRight = idx === current.correct_index
            let optionClass = 'border border-gray-200 bg-white hover:border-brand-yellow hover:bg-brand-yellow-light cursor-pointer'
            if (isAnswered) {
              if (isRight) optionClass = 'border-2 border-brand-green bg-green-50'
              else if (isSelected && !isRight) optionClass = 'border-2 border-red-300 bg-red-50'
              else optionClass = 'border border-gray-100 bg-gray-50 opacity-60'
            }
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={cn('w-full text-left p-4 rounded-xl transition-all duration-150 flex items-start gap-3', optionClass)}
              >
                <div className={cn(
                  'w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold',
                  isAnswered && isRight ? 'bg-brand-green border-brand-green text-white' :
                  isAnswered && isSelected && !isRight ? 'bg-red-400 border-red-400 text-white' :
                  'border-gray-300 text-gray-400'
                )}>
                  {isAnswered && isRight ? '✓' : isAnswered && isSelected && !isRight ? '✗' : String.fromCharCode(65 + idx)}
                </div>
                <span className="text-sm text-brand-brown leading-relaxed">{option}</span>
              </button>
            )
          })}
        </div>
      </div>

      {showExplication && (
        <div className={cn(
          'card p-5 animate-in border-l-4',
          isCorrect ? 'border-brand-green bg-green-50' : 'border-orange-400 bg-orange-50'
        )}>
          <div className="flex items-center gap-2 mb-2">
            {isCorrect
              ? <CheckCircle2 size={18} className="text-brand-green" />
              : <XCircle size={18} className="text-orange-500" />
            }
            <span className={cn('font-semibold text-sm', isCorrect ? 'text-green-700' : 'text-orange-700')}>
              {isCorrect ? 'Bonne réponse !' : 'Pas tout à fait…'}
            </span>
          </div>
          <p className="text-sm text-brand-brown-light leading-relaxed">{current.explication}</p>
        </div>
      )}

      {isAnswered && (
        <button onClick={handleNext} className="btn-primary w-full justify-center animate-in">
          {currentIdx < questions.length - 1
            ? <><ChevronRight size={18} />Question suivante</>
            : <><Trophy size={18} />Voir les résultats</>
          }
        </button>
      )}
    </div>
  )
}
