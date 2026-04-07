'use client'

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ChevronDown, ChevronUp, Lightbulb, CheckCircle2 } from 'lucide-react'
import type { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  module: Module
  onComplete?: () => void
}

export default function CourseViewer({ module, onComplete }: Props) {
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]))
  const [showAllSections, setShowAllSections] = useState(false)

  const toggleSection = (idx: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      return next
    })
  }

  const handleExpandAll = () => {
    if (showAllSections) {
      setOpenSections(new Set([0]))
      setShowAllSections(false)
    } else {
      setOpenSections(new Set(module.cours.sections.map((_, i) => i)))
      setShowAllSections(true)
    }
  }

  return (
    <div className="space-y-6">
      {/* Introduction */}
      <div className="card p-6 bg-brand-brown text-white rounded-2xl">
        <h2 className="text-lg font-bold text-brand-yellow mb-3">Introduction</h2>
        <p className="text-gray-300 leading-relaxed text-sm">{module.cours.introduction}</p>
      </div>

      {/* Sections header */}
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-brand-brown">
          {module.cours.sections.length} sections
        </h3>
        <button
          onClick={handleExpandAll}
          className="text-sm text-brand-brown-lighter hover:text-brand-brown transition-colors"
        >
          {showAllSections ? 'Réduire tout' : 'Tout développer'}
        </button>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3">
        {module.cours.sections.map((section, idx) => {
          const isOpen = openSections.has(idx)
          return (
            <div
              key={idx}
              className={cn(
                'card overflow-hidden transition-all duration-200',
                isOpen && 'ring-1 ring-brand-yellow/30'
              )}
            >
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-brand-off-white/50 transition-colors"
              >
                <span className="font-semibold text-brand-brown text-sm pr-4">{section.titre}</span>
                {isOpen ? (
                  <ChevronUp size={18} className="text-brand-yellow shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-brand-brown-lighter shrink-0" />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-6 border-t border-gray-100">
                  <div className="prose-fineduc mt-4 text-sm">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="overflow-x-auto my-4">
                            <table className="prose-fineduc">{children}</table>
                          </div>
                        ),
                        code: ({ className, children, ...props }) => {
                          const isBlock = className?.includes('language-')
                          if (isBlock) {
                            return (
                              <pre className="bg-brand-brown text-brand-yellow-light p-4 rounded-xl overflow-x-auto my-4 text-xs font-mono">
                                <code>{children}</code>
                              </pre>
                            )
                          }
                          return (
                            <code className="bg-brand-off-white px-1.5 py-0.5 rounded text-xs font-mono text-brand-brown" {...props}>
                              {children}
                            </code>
                          )
                        },
                      }}
                    >
                      {section.contenu}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Points clés */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb size={18} className="text-brand-yellow" />
          <h3 className="font-bold text-brand-brown">Points clés à retenir</h3>
        </div>
        <ul className="space-y-3">
          {module.cours.points_cles.map((point, idx) => (
            <li key={idx} className="flex items-start gap-3">
              <div className="w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-brand-brown">{idx + 1}</span>
              </div>
              <span className="text-sm text-brand-brown-light leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bouton complétion */}
      {onComplete && (
        <button
          onClick={onComplete}
          className="w-full flex items-center justify-center gap-2 py-4 bg-brand-green text-brand-brown font-bold rounded-2xl hover:bg-brand-green-dark transition-colors"
        >
          <CheckCircle2 size={20} />
          Marquer le cours comme terminé
        </button>
      )}
    </div>
  )
}
