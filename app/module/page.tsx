'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Filter, Clock, BookOpen, CheckCircle2 } from 'lucide-react'
import { ALL_MODULES, DOMAINS, getDomainIcon, getLevelColor, getTagColor } from '@/lib/content'
import { getUserProgress, getUser } from '@/lib/supabase'
import type { UserProgress } from '@/lib/types'
import { cn } from '@/lib/utils'

const LEVELS = ['Tous', 'Débutant', 'Intermédiaire', 'Avancé', 'Expert']

export default function ModulesPage() {
  const [search, setSearch] = useState('')
  const [selectedDomain, setSelectedDomain] = useState('Tous')
  const [selectedLevel, setSelectedLevel] = useState('Tous')
  const [progress, setProgress] = useState<UserProgress[]>([])

  useEffect(() => {
    getUser().then((u) => getUserProgress(u?.id || '').then(setProgress))
  }, [])

  const filtered = ALL_MODULES.filter((m) => {
    const matchSearch = m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.domain.toLowerCase().includes(search.toLowerCase()) ||
      m.tag.toLowerCase().includes(search.toLowerCase())
    const matchDomain = selectedDomain === 'Tous' || m.domain === selectedDomain
    const matchLevel = selectedLevel === 'Tous' || m.level === selectedLevel
    return matchSearch && matchDomain && matchLevel
  })

  const completedCount = progress.filter((p) => p.status === 'completed').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-brand-brown mb-2">Bibliothèque des modules</h1>
        <p className="text-brand-brown-lighter">
          {ALL_MODULES.length} modules · {completedCount} terminés ·{' '}
          <span className="text-brand-brown font-medium">
            {Math.round((completedCount / ALL_MODULES.length) * 100)}% complété
          </span>
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un module..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl px-3 py-2">
            <Filter size={14} className="text-gray-400" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="text-sm text-brand-brown bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="Tous">Tous les domaines</option>
              {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <select
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm text-brand-brown focus:outline-none cursor-pointer"
          >
            {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-brand-brown-lighter mb-4">
        {filtered.length} module{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
      </p>

      {/* Grouped by domain */}
      {DOMAINS.filter((d) => selectedDomain === 'Tous' || d === selectedDomain).map((domain) => {
        const domainModules = filtered.filter((m) => m.domain === domain)
        if (domainModules.length === 0) return null
        return (
          <div key={domain} className="mb-10">
            <h2 className="flex items-center gap-2 text-lg font-bold text-brand-brown mb-4">
              <span>{getDomainIcon(domain)}</span>
              {domain}
              <span className="text-sm font-normal text-brand-brown-lighter">({domainModules.length})</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {domainModules.map((mod) => {
                const prog = progress.find((p) => p.module_id === mod.id)
                const isCompleted = prog?.status === 'completed'
                const isInProgress = prog?.status === 'in_progress'
                return (
                  <Link
                    key={mod.id}
                    href={`/module/${mod.id}`}
                    className={cn(
                      'card-hover p-5 relative',
                      isCompleted && 'ring-1 ring-brand-green/30'
                    )}
                  >
                    {/* Status indicator */}
                    {isCompleted && (
                      <div className="absolute top-3 right-3">
                        <CheckCircle2 size={18} className="text-brand-green" />
                      </div>
                    )}
                    {isInProgress && !isCompleted && (
                      <div className="absolute top-3 right-3 w-2.5 h-2.5 bg-brand-yellow rounded-full" />
                    )}

                    <div className="mb-3">
                      <span className={cn('badge text-xs', getTagColor(mod.tag))}>{mod.tag}</span>
                    </div>

                    <h3 className="font-semibold text-brand-brown text-sm mb-2 line-clamp-2 pr-6">
                      {mod.label}
                    </h3>

                    <p className="text-xs text-brand-brown-lighter line-clamp-2 mb-4">
                      {mod.cours.introduction.substring(0, 100)}...
                    </p>

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn('badge', getLevelColor(mod.level))}>{mod.level}</span>
                      <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                        <Clock size={11} />{mod.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                        <BookOpen size={11} />{mod.quiz.length} quiz
                      </span>
                    </div>

                    {prog?.quiz_score !== undefined && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-brand-brown-lighter">Score quiz</span>
                        <span className={cn(
                          'text-xs font-bold',
                          prog.quiz_score >= 80 ? 'text-brand-green' :
                          prog.quiz_score >= 60 ? 'text-yellow-600' : 'text-red-500'
                        )}>
                          {prog.quiz_score}%
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        )
      })}

      {filtered.length === 0 && (
        <div className="text-center py-16 text-brand-brown-lighter">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>Aucun module trouvé pour cette recherche.</p>
        </div>
      )}
    </div>
  )
}
