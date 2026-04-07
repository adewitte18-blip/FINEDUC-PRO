'use client'

import { useState, useCallback } from 'react'
import { RotateCcw, ThumbsUp, ThumbsDown, Meh, Shuffle, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Flashcard } from '@/lib/types'
import { upsertFlashcardReview, computeNextReview } from '@/lib/supabase'
import { shuffle } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface Props {
  flashcards: Flashcard[]
  userId?: string
  title?: string
}

export default function FlashcardDeck({ flashcards: initialCards, userId = '', title }: Props) {
  const [cards, setCards] = useState(initialCards)
  const [currentIdx, setCurrentIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState<Set<string>>(new Set())
  const [finished, setFinished] = useState(false)
  const [scores, setScores] = useState<Record<string, number>>({})

  const current = cards[currentIdx]
  const progress = (reviewed.size / cards.length) * 100

  const handleFlip = () => setFlipped((f) => !f)

  const handleRate = useCallback(async (quality: 0 | 3 | 5) => {
    if (!current) return

    // Enregistrer la révision
    const review = {
      user_id: userId,
      flashcard_id: current.id,
      module_id: current.moduleId,
      ease_factor: 2.5,
      interval_days: 1,
      correct_streak: 0,
    }
    const updated = computeNextReview(review, quality)
    await upsertFlashcardReview(updated)

    setScores((s) => ({ ...s, [current.id]: quality }))
    setReviewed((r) => new Set([...r, current.id]))

    // Aller à la suivante
    if (currentIdx < cards.length - 1) {
      setCurrentIdx(currentIdx + 1)
      setFlipped(false)
    } else {
      setFinished(true)
    }
  }, [current, currentIdx, cards.length, userId])

  const handleShuffle = () => {
    setCards(shuffle(initialCards))
    setCurrentIdx(0)
    setFlipped(false)
    setReviewed(new Set())
    setFinished(false)
    setScores({})
  }

  const handleRestart = () => {
    setCurrentIdx(0)
    setFlipped(false)
    setReviewed(new Set())
    setFinished(false)
    setScores({})
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 text-brand-brown-lighter">
        <p>Aucune flashcard disponible pour ce module.</p>
      </div>
    )
  }

  if (finished) {
    const goodCount = Object.values(scores).filter((s) => s >= 3).length
    const badCount = Object.values(scores).filter((s) => s === 0).length
    return (
      <div className="card p-8 text-center animate-in">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-black text-brand-brown mb-2">Session terminée !</h3>
        <p className="text-brand-brown-lighter mb-6">
          {goodCount} connue{goodCount > 1 ? 's' : ''} · {badCount} à retravailler
        </p>

        <div className="flex gap-2 justify-center mb-6">
          {cards.map((c) => (
            <div
              key={c.id}
              className={cn(
                'w-3 h-3 rounded-full',
                scores[c.id] === 5 ? 'bg-brand-green' :
                scores[c.id] === 3 ? 'bg-brand-yellow' : 'bg-red-400'
              )}
            />
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={handleRestart} className="btn-secondary flex-1">
            <RotateCcw size={16} />
            Recommencer
          </button>
          <button onClick={handleShuffle} className="btn-primary flex-1">
            <Shuffle size={16} />
            Mélanger
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          {title && <h3 className="font-bold text-brand-brown">{title}</h3>}
          <p className="text-sm text-brand-brown-lighter">
            {currentIdx + 1} / {cards.length} · {reviewed.size} révisées
          </p>
        </div>
        <button onClick={handleShuffle} className="btn-ghost">
          <Shuffle size={16} />
          Mélanger
        </button>
      </div>

      {/* Progress bar */}
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Carte */}
      <div
        onClick={handleFlip}
        className="cursor-pointer select-none"
        style={{ perspective: '1000px' }}
      >
        <div
          className={cn(
            'relative transition-transform duration-500',
            flipped && '[transform:rotateY(180deg)]'
          )}
          style={{ transformStyle: 'preserve-3d', minHeight: '260px' }}
        >
          {/* Recto */}
          <div
            className="absolute inset-0 card p-8 flex flex-col items-center justify-center text-center"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-xs font-medium text-brand-brown-lighter mb-4 uppercase tracking-wider">
              {current.categorie || 'Concept'}
            </div>
            <p className="text-lg font-semibold text-brand-brown leading-relaxed">
              {current.recto}
            </p>
            <div className="mt-6 text-xs text-brand-brown-lighter flex items-center gap-1">
              <RotateCcw size={12} />
              Cliquez pour retourner
            </div>
          </div>

          {/* Verso */}
          <div
            className="absolute inset-0 card p-8 flex flex-col items-center justify-center text-center bg-brand-brown text-white"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <div className="text-xs font-medium text-brand-yellow mb-4 uppercase tracking-wider">
              Réponse
            </div>
            <p className="text-base text-gray-200 leading-relaxed">{current.verso}</p>
          </div>
        </div>
      </div>

      {/* Navigation rapide */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { if (currentIdx > 0) { setCurrentIdx(currentIdx - 1); setFlipped(false) } }}
          disabled={currentIdx === 0}
          className="btn-ghost disabled:opacity-30"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Boutons d'évaluation (affichés seulement si retourné) */}
        {flipped ? (
          <div className="flex gap-3">
            <button
              onClick={() => handleRate(0)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
            >
              <ThumbsDown size={20} />
              <span className="text-xs font-medium">À revoir</span>
            </button>
            <button
              onClick={() => handleRate(3)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-yellow-50 text-yellow-600 hover:bg-yellow-100 transition-colors"
            >
              <Meh size={20} />
              <span className="text-xs font-medium">Hésitant</span>
            </button>
            <button
              onClick={() => handleRate(5)}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            >
              <ThumbsUp size={20} />
              <span className="text-xs font-medium">Je sais !</span>
            </button>
          </div>
        ) : (
          <p className="text-sm text-brand-brown-lighter">Retournez la carte pour évaluer</p>
        )}

        <button
          onClick={() => { if (currentIdx < cards.length - 1) { setCurrentIdx(currentIdx + 1); setFlipped(false) } }}
          disabled={currentIdx === cards.length - 1}
          className="btn-ghost disabled:opacity-30"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
