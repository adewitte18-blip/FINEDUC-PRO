'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { FileText, ChevronDown, ChevronUp, Eye, EyeOff } from 'lucide-react'
import type { CasPratique } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  casPratique: CasPratique
}

export default function CasPratiqueViewer({ casPratique }: Props) {
  const [showCorrection, setShowCorrection] = useState(false)
  const [openQuestion, setOpenQuestion] = useState<number | null>(0)
  const [userNotes, setUserNotes] = useState<string[]>(
    Array(casPratique.questions?.length || 0).fill('')
  )

  const questions = casPratique.questions || []
  const elementsReponse = casPratique.elements_de_reponse
  const correction = casPratique.correction

  return (
    <div className="space-y-6">
      {/* Titre & Contexte */}
      <div className="card p-6">
        <div className="flex items-start gap-3 mb-4">
          <FileText size={20} className="text-brand-yellow shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-brand-brown text-base">{casPratique.titre}</h3>
            <p className="text-xs text-brand-brown-lighter mt-0.5">Cas pratique d&apos;application</p>
          </div>
        </div>
        <div className="bg-brand-off-white rounded-xl p-4">
          <h4 className="font-semibold text-brand-brown text-sm mb-2">Contexte</h4>
          <p className="text-sm text-brand-brown-light leading-relaxed">{casPratique.contexte}</p>
        </div>
      </div>

      {/* Données financières */}
      {casPratique.donnees_financieres && (
        <div className="card p-6">
          <h4 className="font-bold text-brand-brown mb-4">Données financières</h4>
          <FinancialDataRenderer data={casPratique.donnees_financieres} />
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-bold text-brand-brown">Questions ({questions.length})</h4>
          {questions.map((question, idx) => (
            <div key={idx} className="card overflow-hidden">
              <button
                onClick={() => setOpenQuestion(openQuestion === idx ? null : idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-brand-off-white/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-brand-yellow rounded-full flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-brand-brown">{idx + 1}</span>
                  </div>
                  <span className="font-medium text-brand-brown text-sm leading-relaxed">
                    {typeof question === 'string' ? question : JSON.stringify(question)}
                  </span>
                </div>
                {openQuestion === idx ? (
                  <ChevronUp size={16} className="shrink-0 text-brand-brown-lighter ml-3" />
                ) : (
                  <ChevronDown size={16} className="shrink-0 text-brand-brown-lighter ml-3" />
                )}
              </button>

              {openQuestion === idx && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <textarea
                    value={userNotes[idx]}
                    onChange={(e) => {
                      const next = [...userNotes]
                      next[idx] = e.target.value
                      setUserNotes(next)
                    }}
                    placeholder="Rédigez votre réponse ici..."
                    rows={4}
                    className="input mt-4 resize-none text-sm"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Éléments de réponse / Correction */}
      <div className="card overflow-hidden">
        <button
          onClick={() => setShowCorrection(!showCorrection)}
          className={cn(
            'w-full flex items-center justify-between p-5 transition-all',
            showCorrection ? 'bg-brand-brown text-white' : 'hover:bg-brand-off-white/50'
          )}
        >
          <div className="flex items-center gap-2">
            {showCorrection ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="font-semibold text-sm">
              {showCorrection ? 'Masquer la correction' : 'Révéler les éléments de réponse'}
            </span>
          </div>
          <ChevronDown size={16} className={cn('transition-transform', showCorrection && 'rotate-180')} />
        </button>

        {showCorrection && (
          <div className="p-5 border-t border-gray-100 animate-in">
            {elementsReponse && (
              <div className="prose-fineduc text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {typeof elementsReponse === 'string'
                    ? elementsReponse
                    : JSON.stringify(elementsReponse, null, 2)}
                </ReactMarkdown>
              </div>
            )}
            {correction && !elementsReponse && (
              <div className="prose-fineduc text-sm">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {typeof correction === 'string'
                    ? correction
                    : JSON.stringify(correction, null, 2)}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Composant pour rendre les données financières (tableaux JSON)
function FinancialDataRenderer({ data }: { data: Record<string, unknown> }) {
  return (
    <div className="space-y-4">
      {Object.entries(data).map(([key, value]) => {
        if (Array.isArray(value) && value.length > 0 && Array.isArray(value[0])) {
          // C'est un tableau de tableaux (tableau financier)
          return (
            <div key={key}>
              <h5 className="font-semibold text-brand-brown text-xs mb-2 uppercase tracking-wide">
                {key.replace(/_/g, ' ')}
              </h5>
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <tbody>
                    {(value as string[][]).map((row, i) => (
                      <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-brand-off-white'}>
                        {row.map((cell: string, j: number) => (
                          <td
                            key={j}
                            className={cn(
                              'px-3 py-2 border-b border-gray-100',
                              i === 0 && 'font-bold bg-brand-brown text-white',
                              j === 0 && i > 0 && 'font-medium text-brand-brown'
                            )}
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          return (
            <div key={key}>
              <h5 className="font-semibold text-brand-brown text-xs mb-2 uppercase tracking-wide">
                {key.replace(/_/g, ' ')}
              </h5>
              {(value as Record<string, unknown>).tableau ? (
                <FinancialDataRenderer data={value as Record<string, unknown>} />
              ) : (
                <div className="bg-brand-off-white rounded-xl p-3 text-xs text-brand-brown-light">
                  <pre className="whitespace-pre-wrap font-mono">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )
        }

        if (typeof value === 'string') {
          return (
            <p key={key} className="text-sm text-brand-brown-light">
              <span className="font-medium">{key.replace(/_/g, ' ')} : </span>
              {value}
            </p>
          )
        }

        return null
      })}
    </div>
  )
}
