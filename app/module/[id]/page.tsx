'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen, HelpCircle, Briefcase, Zap, ChevronLeft,
  Clock, Star, CheckCircle2, BarChart2
} from 'lucide-react'
import { getModuleById, getLevelColor, getTagColor, getDomainIcon, getFlashcardsByModule } from '@/lib/content'
import { getUserProgress, upsertProgress, getUser } from '@/lib/supabase'
import CourseViewer from '@/components/modules/CourseViewer'
import QuizEngine from '@/components/modules/QuizEngine'
import CasPratiqueViewer from '@/components/modules/CasPratiqueViewer'
import FlashcardDeck from '@/components/features/FlashcardDeck'
import type { UserProgress } from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = 'cours' | 'quiz' | 'cas' | 'flashcards'

interface Props {
  params: { id: string }
}

export default function ModulePage({ params }: Props) {
  const { id } = params
  const module = getModuleById(id)
  const flashcards = getFlashcardsByModule(id)

  const [activeTab, setActiveTab] = useState<Tab>('cours')
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    getUser().then((u) => {
      const uid = u?.id || ''
      setUserId(uid)
      getUserProgress(uid).then((all) => {
        const p = all.find((p) => p.module_id === id) || null
        setProgress(p)
      })
    })
  }, [id])

  if (!module) return notFound()

  const tabs: { id: Tab; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'cours', label: 'Cours', icon: BookOpen },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle, count: module.quiz.length },
    ...(module.cas_pratique ? [{ id: 'cas' as Tab, label: 'Cas pratique', icon: Briefcase }] : []),
    ...(flashcards.length > 0 ? [{ id: 'flashcards' as Tab, label: 'Flashcards', icon: Zap, count: flashcards.length }] : []),
  ]

  const handleCourseComplete = async () => {
    const updated: UserProgress = {
      user_id: userId,
      module_id: id,
      status: progress?.quiz_score !== undefined ? 'completed' : 'in_progress',
      cours_completed: true,
      last_visited: new Date().toISOString(),
      ...(progress || {}),
    }
    await upsertProgress(updated)
    setProgress(updated)
  }

  const handleQuizComplete = async (score: number) => {
    const updated: UserProgress = {
      user_id: userId,
      module_id: id,
      status: score >= 40 ? 'completed' : 'in_progress',
      quiz_score: score,
      quiz_attempts: (progress?.quiz_attempts || 0) + 1,
      completed_at: score >= 40 ? new Date().toISOString() : undefined,
      last_visited: new Date().toISOString(),
      ...(progress || {}),
    }
    await upsertProgress(updated)
    setProgress(updated)
  }

  const isCompleted = progress?.status === 'completed'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back link */}
      <Link
        href="/module"
        className="inline-flex items-center gap-1.5 text-brand-brown-lighter hover:text-brand-brown text-sm mb-6 transition-colors"
      >
        <ChevronLeft size={16} />
        Retour aux modules
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-3xl">{getDomainIcon(module.domain)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn('badge', getTagColor(module.tag))}>{module.tag}</span>
              <span className={cn('badge', getLevelColor(module.level))}>{module.level}</span>
              {isCompleted && (
                <span className="badge bg-brand-green/20 text-green-700">
                  <CheckCircle2 size={12} className="mr-1" /> Terminé
                </span>
              )}
            </div>
            <h1 className="text-xl font-black text-brand-brown mb-1">{module.label}</h1>
            <p className="text-sm text-brand-brown-lighter">{module.domain}</p>

            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                <Clock size={13} />{module.duration}
              </span>
              <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                <BookOpen size={13} />{module.cours.sections.length} sections
              </span>
              <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                <HelpCircle size={13} />{module.quiz.length} questions
              </span>
              {progress?.quiz_score !== undefined && (
                <span className="flex items-center gap-1 text-xs font-medium text-brand-brown">
                  <BarChart2 size={13} className="text-brand-yellow" />
                  Score : {progress.quiz_score}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ id: tabId, label, icon: Icon, count }) => (
          <button
            key={tabId}
            onClick={() => setActiveTab(tabId)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              activeTab === tabId
                ? 'bg-brand-brown text-white shadow-sm'
                : 'bg-white text-brand-brown-lighter border border-gray-200 hover:border-brand-yellow hover:text-brand-brown'
            )}
          >
            <Icon size={15} />
            {label}
            {count !== undefined && (
              <span className={cn(
                'ml-0.5 text-xs px-1.5 py-0.5 rounded-full',
                activeTab === tabId ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              )}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'cours' && (
        <CourseViewer module={module} onComplete={handleCourseComplete} />
      )}
      {activeTab === 'quiz' && (
        <div>
          {progress?.quiz_score !== undefined && (
            <div className="card p-4 mb-4 bg-brand-off-white flex items-center justify-between">
              <div className="text-sm text-brand-brown-lighter">
                Dernier score : <span className="font-bold text-brand-brown">{progress.quiz_score}%</span>
                {progress.quiz_attempts && ` (tentative ${progress.quiz_attempts})`}
              </div>
              <Star size={16} className="text-brand-yellow" />
            </div>
          )}
          <QuizEngine
            questions={module.quiz}
            moduleLabel={module.label}
            onComplete={handleQuizComplete}
          />
        </div>
      )}
      {activeTab === 'cas' && module.cas_pratique && (
        <CasPratiqueViewer casPratique={module.cas_pratique} />
      )}
      {activeTab === 'flashcards' && (
        <FlashcardDeck
          flashcards={flashcards}
          userId={userId}
        />
      )}
    </div>
  )
}
