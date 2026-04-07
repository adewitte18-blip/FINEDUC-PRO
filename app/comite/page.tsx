'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Trophy, Play, Pause, SkipForward, RotateCcw, ChevronRight, Timer, Target, CheckCircle2 } from 'lucide-react'
import { ALL_MODULES, getDomainIcon } from '@/lib/content'
import { cn } from '@/lib/utils'

// Questions type "comité" tirées des quiz et cas pratiques
const COMITE_MODULES = ALL_MODULES.filter((m) =>
  ['m1', 'm2', 'm3', 'mcompta', 'm6', 'meval', 'mtra', 'msoft'].includes(m.id)
)

interface ComiteQuestion {
  question: string
  context: string
  moduleLabel: string
  moduleId: string
  type: 'analyse' | 'decision' | 'challenge'
}

const buildComiteQuestions = (moduleIds: string[]): ComiteQuestion[] => {
  const questions: ComiteQuestion[] = []
  for (const mod of ALL_MODULES.filter((m) => moduleIds.includes(m.id))) {
    // Prendre les questions de quiz orientées "comité"
    for (const q of mod.quiz.slice(0, 2)) {
      questions.push({
        question: q.question,
        context: q.explication,
        moduleLabel: mod.label,
        moduleId: mod.id,
        type: 'analyse',
      })
    }
    // Ajouter des questions du cas pratique si disponible
    if (mod.cas_pratique?.questions) {
      for (const q of (mod.cas_pratique.questions as string[]).slice(0, 1)) {
        questions.push({
          question: typeof q === 'string' ? q : String(q),
          context: `Cas pratique : ${mod.cas_pratique.titre}`,
          moduleLabel: mod.label,
          moduleId: mod.id,
          type: 'decision',
        })
      }
    }
  }
  return questions.slice(0, 20)
}

type Stage = 'config' | 'session' | 'review'

export default function ComitePage() {
  const [stage, setStage] = useState<Stage>('config')
  const [selectedModules, setSelectedModules] = useState<string[]>(['m1', 'm2', 'm3'])
  const [timePerQuestion, setTimePerQuestion] = useState(90) // secondes
  const [questions, setQuestions] = useState<ComiteQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [paused, setPaused] = useState(false)
  const [notes, setNotes] = useState<string[]>([])
  const [selfScores, setSelfScores] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const current = questions[currentIdx]
  const progressPercent = ((currentIdx) / Math.max(1, questions.length)) * 100

  useEffect(() => {
    if (stage !== 'session' || paused) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }
    setTimeLeft(timePerQuestion)
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, stage, paused])

  const handleStart = () => {
    const qs = buildComiteQuestions(selectedModules)
    setQuestions(qs)
    setNotes(Array(qs.length).fill(''))
    setSelfScores(Array(qs.length).fill(-1))
    setCurrentIdx(0)
    setStage('session')
  }

  const handleNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1)
      setPaused(false)
    } else {
      setStage('review')
    }
  }

  const handleSelfScore = (score: number) => {
    const next = [...selfScores]
    next[currentIdx] = score
    setSelfScores(next)
  }

  const avgScore = selfScores.filter((s) => s >= 0).length > 0
    ? Math.round(selfScores.filter((s) => s >= 0).reduce((a, b) => a + b, 0) / selfScores.filter((s) => s >= 0).length * 20)
    : 0

  const timeColor = timeLeft > timePerQuestion * 0.5
    ? 'text-brand-green'
    : timeLeft > timePerQuestion * 0.25
    ? 'text-yellow-500'
    : 'text-red-500'

  const toggleModule = (id: string) => {
    setSelectedModules((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* ─── CONFIG ─── */}
      {stage === 'config' && (
        <div className="space-y-6 animate-in">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Trophy size={28} className="text-brand-brown" />
            </div>
            <h1 className="text-3xl font-black text-brand-brown mb-2">Mode Comité</h1>
            <p className="text-brand-brown-lighter max-w-md mx-auto">
              Simulez un passage en comité d&apos;engagement Bpifrance. Répondez à chaud sous contrainte
              de temps, puis évaluez votre performance.
            </p>
          </div>

          {/* Sélection des modules */}
          <div className="card p-6">
            <h3 className="font-bold text-brand-brown mb-1">Modules à couvrir</h3>
            <p className="text-xs text-brand-brown-lighter mb-4">
              Sélectionnez les domaines sur lesquels vous souhaitez être challengé
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_MODULES.map((mod) => (
                <button
                  key={mod.id}
                  onClick={() => toggleModule(mod.id)}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-xl text-xs text-left transition-all border',
                    selectedModules.includes(mod.id)
                      ? 'border-brand-yellow bg-brand-yellow-light font-medium text-brand-brown'
                      : 'border-gray-200 text-brand-brown-lighter hover:border-gray-300'
                  )}
                >
                  <span>{getDomainIcon(mod.domain)}</span>
                  <span className="line-clamp-2">{mod.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Timing */}
          <div className="card p-6">
            <h3 className="font-bold text-brand-brown mb-4">Temps par question</h3>
            <div className="flex gap-3">
              {[60, 90, 120, 180].map((t) => (
                <button
                  key={t}
                  onClick={() => setTimePerQuestion(t)}
                  className={cn(
                    'flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all',
                    timePerQuestion === t
                      ? 'bg-brand-yellow text-brand-brown border-brand-yellow'
                      : 'border-gray-200 text-brand-brown-lighter hover:border-gray-300'
                  )}
                >
                  {t}s
                </button>
              ))}
            </div>
          </div>

          <div className="card p-4 bg-brand-off-white">
            <p className="text-sm text-brand-brown">
              <strong>{buildComiteQuestions(selectedModules).length} questions</strong> générées ·{' '}
              <strong>~{Math.ceil(buildComiteQuestions(selectedModules).length * timePerQuestion / 60)} min</strong> de session
            </p>
          </div>

          <button
            onClick={handleStart}
            disabled={selectedModules.length === 0}
            className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
          >
            <Play size={20} />
            Démarrer la simulation
          </button>
        </div>
      )}

      {/* ─── SESSION ─── */}
      {stage === 'session' && current && (
        <div className="space-y-4 animate-in">
          {/* Header session */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                <Trophy size={16} className="text-brand-brown" />
              </div>
              <div>
                <div className="text-xs font-medium text-brand-brown-lighter">Mode Comité</div>
                <div className="text-sm font-bold text-brand-brown">
                  Question {currentIdx + 1}/{questions.length}
                </div>
              </div>
            </div>
            {/* Timer */}
            <div className={cn('flex items-center gap-1.5 font-mono font-bold text-xl', timeColor)}>
              <Timer size={18} />
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
          </div>

          {/* Progress */}
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>

          {/* Type & module */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              'badge text-xs',
              current.type === 'decision' ? 'bg-orange-100 text-orange-700' :
              current.type === 'challenge' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            )}>
              {current.type === 'decision' ? '⚖️ Décision' : current.type === 'challenge' ? '🔥 Challenge' : '📊 Analyse'}
            </span>
            <span className="text-xs text-brand-brown-lighter">{getDomainIcon('')} {current.moduleLabel}</span>
          </div>

          {/* Question */}
          <div className="card p-6 bg-brand-brown text-white">
            <div className="text-xs text-brand-yellow mb-3 font-medium uppercase tracking-wider">
              Le comité vous demande :
            </div>
            <h3 className="text-lg font-semibold leading-relaxed">{current.question}</h3>
          </div>

          {/* Zone de notes */}
          <div className="card p-5">
            <label className="text-sm font-medium text-brand-brown mb-2 block">
              Votre réponse (notes rapides)
            </label>
            <textarea
              value={notes[currentIdx] || ''}
              onChange={(e) => {
                const next = [...notes]
                next[currentIdx] = e.target.value
                setNotes(next)
              }}
              placeholder="Structurez votre réponse : contexte → analyse → risques → recommandation..."
              rows={4}
              className="input resize-none text-sm"
            />
          </div>

          {/* Auto-évaluation */}
          <div className="card p-5">
            <p className="text-sm font-medium text-brand-brown mb-3">
              Auto-évaluation de votre réponse :
            </p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  onClick={() => handleSelfScore(score)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-sm font-bold border transition-all',
                    selfScores[currentIdx] === score
                      ? 'bg-brand-yellow border-brand-yellow text-brand-brown'
                      : 'border-gray-200 text-brand-brown-lighter hover:border-gray-300'
                  )}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-brand-brown-lighter mt-1">
              <span>Insuffisant</span>
              <span>Excellent</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() => setPaused(!paused)}
              className="btn-secondary"
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
              {paused ? 'Reprendre' : 'Pause'}
            </button>
            <button onClick={handleNext} className="btn-primary flex-1 justify-center">
              {currentIdx < questions.length - 1 ? (
                <>Question suivante <SkipForward size={16} /></>
              ) : (
                <>Terminer <CheckCircle2 size={16} /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── REVIEW ─── */}
      {stage === 'review' && (
        <div className="space-y-6 animate-in">
          <div className="text-center">
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl font-black text-brand-brown mb-1">Session terminée !</h2>
            <p className="text-brand-brown-lighter">
              Score moyen d&apos;auto-évaluation : <strong>{avgScore}%</strong>
            </p>
          </div>

          <div className="space-y-3">
            {questions.map((q, i) => (
              <div key={i} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-sm',
                    selfScores[i] >= 4 ? 'bg-brand-green text-white' :
                    selfScores[i] >= 3 ? 'bg-brand-yellow text-brand-brown' :
                    selfScores[i] >= 1 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                  )}>
                    {selfScores[i] >= 1 ? selfScores[i] : '—'}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-brand-brown line-clamp-2">{q.question}</p>
                    <p className="text-xs text-brand-brown-lighter mt-0.5">{q.moduleLabel}</p>
                    {notes[i] && (
                      <div className="mt-2 p-2 bg-brand-off-white rounded-lg">
                        <p className="text-xs text-brand-brown-light">{notes[i]}</p>
                      </div>
                    )}
                    {/* Context / correction */}
                    <details className="mt-2">
                      <summary className="text-xs text-brand-brown-lighter cursor-pointer hover:text-brand-brown">
                        Voir les éléments de réponse
                      </summary>
                      <p className="text-xs text-brand-brown-light mt-1 p-2 bg-brand-off-white rounded-lg leading-relaxed">
                        {q.context}
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStage('config')} className="btn-secondary flex-1">
              <RotateCcw size={16} />
              Nouvelle session
            </button>
            <Link href="/module" className="btn-primary flex-1 justify-center">
              Réviser les modules <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
