'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Clock, BookOpen, CheckCircle2, Play, Lock } from 'lucide-react'
import { PARCOURS_LIST, getModuleById, getLevelColor } from '@/lib/content'
import { getUserProgress, getUser } from '@/lib/supabase'
import type { UserProgress } from '@/lib/types'
import { cn, getProgressPercent } from '@/lib/utils'

export default function ParcoursPage() {
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    getUser().then((u) => getUserProgress(u?.id || '').then(setProgress))
    // Handle anchor from URL
    const hash = window.location.hash.replace('#', '')
    if (hash) setExpanded(hash)
  }, [])

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-brown mb-2">Parcours guidés</h1>
        <p className="text-brand-brown-lighter">
          7 parcours thématiques structurés pour progresser efficacement selon votre profil.
        </p>
      </div>

      {/* Grid de parcours */}
      <div className="space-y-4">
        {PARCOURS_LIST.map((parcours) => {
          const completedInParcours = parcours.moduleIds.filter((id) =>
            progress.some((p) => p.module_id === id && p.status === 'completed')
          ).length
          const progressPercent = getProgressPercent(completedInParcours, parcours.moduleIds.length)
          const isExpanded = expanded === parcours.id

          return (
            <div
              key={parcours.id}
              id={parcours.id}
              className={cn(
                'card overflow-hidden transition-all duration-200',
                isExpanded && 'ring-1 ring-brand-yellow/30'
              )}
            >
              {/* Header du parcours */}
              <button
                onClick={() => setExpanded(isExpanded ? null : parcours.id)}
                className="w-full text-left p-6 hover:bg-brand-off-white/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                    style={{ backgroundColor: parcours.color + '20' }}
                  >
                    {parcours.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-brand-brown text-base">{parcours.label}</h3>
                      <span className={cn('badge', getLevelColor(parcours.level))}>
                        {parcours.level}
                      </span>
                      {progressPercent === 100 && (
                        <span className="badge bg-brand-green/20 text-green-700">
                          <CheckCircle2 size={11} className="mr-1" />Terminé
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-brand-brown-lighter mb-3 line-clamp-2">
                      {parcours.description}
                    </p>

                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                        <BookOpen size={12} />{parcours.moduleIds.length} modules
                      </span>
                      <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                        <Clock size={12} />{parcours.estimatedHours}h estimées
                      </span>
                      <span className="text-xs text-brand-brown-lighter">
                        👥 {parcours.targetAudience}
                      </span>
                    </div>

                    {/* Barre de progression */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex-1 progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${progressPercent}%`,
                            backgroundColor: parcours.color,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-brand-brown whitespace-nowrap">
                        {completedInParcours}/{parcours.moduleIds.length}
                      </span>
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className={cn(
                      'text-brand-brown-lighter shrink-0 transition-transform mt-1',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </div>
              </button>

              {/* Modules list */}
              {isExpanded && (
                <div className="border-t border-gray-100 p-6 pt-4 animate-in">
                  <div className="grid sm:grid-cols-2 gap-2">
                    {parcours.moduleIds.map((moduleId, idx) => {
                      const mod = getModuleById(moduleId)
                      if (!mod) return null
                      const prog = progress.find((p) => p.module_id === moduleId)
                      const isCompleted = prog?.status === 'completed'
                      const isInProgress = prog?.status === 'in_progress'
                      const prevCompleted = idx === 0 || progress.some(
                        (p) => p.module_id === parcours.moduleIds[idx - 1] && p.status === 'completed'
                      )

                      return (
                        <Link
                          key={moduleId}
                          href={`/module/${moduleId}`}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl transition-all group',
                            isCompleted
                              ? 'bg-green-50 hover:bg-green-100'
                              : isInProgress
                              ? 'bg-brand-yellow-light hover:bg-brand-yellow/30'
                              : 'bg-gray-50 hover:bg-gray-100'
                          )}
                        >
                          <div className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold',
                            isCompleted ? 'bg-brand-green text-white' :
                            isInProgress ? 'bg-brand-yellow text-brand-brown' :
                            'bg-gray-200 text-gray-500'
                          )}>
                            {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-brand-brown truncate">
                              {mod.label}
                            </div>
                            <div className="text-xs text-brand-brown-lighter flex items-center gap-2">
                              <Clock size={10} />{mod.duration}
                              {prog?.quiz_score !== undefined && (
                                <span className="text-brand-brown font-medium">· {prog.quiz_score}%</span>
                              )}
                            </div>
                          </div>

                          <ChevronRight
                            size={14}
                            className="text-brand-brown-lighter shrink-0 group-hover:translate-x-0.5 transition-transform"
                          />
                        </Link>
                      )
                    })}
                  </div>

                  <div className="mt-4 flex gap-3">
                    {completedInParcours === 0 ? (
                      <Link
                        href={`/module/${parcours.moduleIds[0]}`}
                        className="btn-primary"
                      >
                        <Play size={16} />
                        Commencer ce parcours
                      </Link>
                    ) : progressPercent < 100 ? (
                      <Link
                        href={`/module/${parcours.moduleIds.find((id) =>
                          !progress.some((p) => p.module_id === id && p.status === 'completed')
                        ) || parcours.moduleIds[0]}`}
                        className="btn-primary"
                      >
                        <Play size={16} />
                        Continuer ({completedInParcours}/{parcours.moduleIds.length})
                      </Link>
                    ) : (
                      <div className="btn-secondary cursor-default">
                        <CheckCircle2 size={16} className="text-brand-green" />
                        Parcours terminé !
                      </div>
                    )}
                    <Link href="/flashcards" className="btn-secondary">
                      Flashcards du parcours
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
