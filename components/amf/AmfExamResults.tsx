'use client'

import Link from 'next/link'
import { CheckCircle2, XCircle, RotateCcw, BookOpen, TrendingUp, TrendingDown } from 'lucide-react'
import type { AmfQuestion, AmfScoreResult, AmfExam } from '@/lib/amf/types'
import { cn } from '@/lib/utils'
import { ALL_AMF_THEMES } from '@/lib/amf/content'

interface Props {
  exam: AmfExam
  questions: AmfQuestion[]
  answers: (number | null)[]
  result: AmfScoreResult
  onRetry?: () => void
}

function ScoreCircle({ score, label, passing }: { score: number; label: string; passing: boolean }) {
  const color = passing ? 'text-brand-green' : 'text-red-500'
  const bg = passing ? 'bg-green-50 border-brand-green' : 'bg-red-50 border-red-300'
  return (
    <div className={cn('flex flex-col items-center p-5 rounded-2xl border-2', bg)}>
      <span className={cn('text-3xl font-black', color)}>{score}%</span>
      <span className="text-xs font-medium text-brand-brown-lighter mt-1">{label}</span>
      <span className={cn('text-xs font-semibold mt-1', color)}>
        {passing ? '✓ Seuil atteint' : '✗ Insuffisant'}
      </span>
    </div>
  )
}

export default function AmfExamResults({ exam, questions, answers, result, onRetry }: Props) {
  const themes = ALL_AMF_THEMES.filter((t) => t.exam === exam)

  return (
    <div className="space-y-6">
      {/* Verdict global */}
      <div className={cn(
        'card p-6 text-center border-2',
        result.passed ? 'bg-green-50 border-brand-green' : 'bg-red-50 border-red-300'
      )}>
        <div className="text-4xl mb-2">{result.passed ? '🎉' : '📚'}</div>
        <h2 className={cn('text-2xl font-black mb-1', result.passed ? 'text-green-700' : 'text-red-600')}>
          {result.passed ? 'Examen réussi !' : 'Examen non validé'}
        </h2>
        <p className="text-brand-brown-lighter text-sm">
          {exam === 'generaliste'
            ? 'Score global : ' + result.score_global + '% · Seuil requis : ≥ 80 % en catégorie A ET ≥ 80 % en catégorie C'
            : 'Score global : ' + result.score_global + '% · Seuil requis : ≥ 80 %'
          }
        </p>
      </div>

      {/* Scores A / C / global */}
      <div className={cn('grid gap-3', exam === 'generaliste' ? 'grid-cols-3' : 'grid-cols-1 max-w-xs mx-auto')}>
        {exam === 'generaliste' && (
          <>
            <ScoreCircle score={result.score_a} label={`Catégorie A (${result.correct_a}/${result.total_a})`} passing={result.score_a >= 80} />
            <ScoreCircle score={result.score_c} label={`Catégorie C (${result.correct_c}/${result.total_c})`} passing={result.score_c >= 80} />
          </>
        )}
        <ScoreCircle score={result.score_global} label="Score global" passing={result.passed} />
      </div>

      {/* Détail par thème */}
      <div className="card p-5">
        <h3 className="font-bold text-brand-brown mb-4 flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-yellow" />
          Résultats par thème
        </h3>
        <div className="space-y-3">
          {themes.map((theme) => {
            const themeResult = result.by_theme[theme.theme_id]
            if (!themeResult) return null
            const { correct, total, score } = themeResult
            const isPassing = score >= 80
            return (
              <div key={theme.theme_id} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500 shrink-0">
                  {theme.theme_id}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-brand-brown truncate">{theme.label}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full', isPassing ? 'bg-brand-green' : 'bg-red-400')}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={cn('text-xs font-semibold whitespace-nowrap', isPassing ? 'text-green-600' : 'text-red-500')}>
                      {correct}/{total} ({score}%)
                    </span>
                  </div>
                </div>
                {isPassing
                  ? <TrendingUp size={14} className="text-brand-green shrink-0" />
                  : <TrendingDown size={14} className="text-red-400 shrink-0" />
                }
              </div>
            )
          })}
        </div>
      </div>

      {/* Révision des erreurs */}
      <div className="card p-5">
        <h3 className="font-bold text-brand-brown mb-4 flex items-center gap-2">
          <XCircle size={16} className="text-red-400" />
          Questions ratées ({questions.length - answers.filter((a, i) => a === questions[i]?.correct_index).length})
        </h3>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {questions.map((q, i) => {
            const userAnswer = answers[i]
            const isCorrect = userAnswer === q.correct_index
            if (isCorrect) return null
            return (
              <div key={q.id} className="border border-red-100 bg-red-50 rounded-xl p-4">
                <p className="text-sm font-medium text-brand-brown mb-2">{q.question}</p>
                <div className="space-y-1 mb-3">
                  {q.options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'text-xs px-3 py-1.5 rounded-lg flex items-center gap-2',
                        idx === q.correct_index ? 'bg-green-100 text-green-700 font-medium' :
                        idx === userAnswer ? 'bg-red-100 text-red-600 line-through' : 'text-gray-400'
                      )}
                    >
                      {idx === q.correct_index ? <CheckCircle2 size={12} /> : idx === userAnswer ? <XCircle size={12} /> : null}
                      {opt}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-brand-brown-lighter italic">{q.explication}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <button onClick={onRetry} className="btn-secondary flex-1">
            <RotateCcw size={16} />Nouvel examen
          </button>
        )}
        <Link href={`/amf/${exam}`} className="btn-primary flex-1 text-center">
          <BookOpen size={16} />Retour aux modules
        </Link>
      </div>
    </div>
  )
}
