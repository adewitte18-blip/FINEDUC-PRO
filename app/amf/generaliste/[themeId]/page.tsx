'use client'

import { useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, BookOpen, HelpCircle } from 'lucide-react'
import { getAmfThemeFile } from '@/lib/amf/content'
import CourseViewer from '@/components/modules/CourseViewer'
import AmfQuizEngine from '@/components/amf/AmfQuizEngine'
import type { Module } from '@/lib/types'
import { cn } from '@/lib/utils'

interface Props {
  params: { themeId: string }
}

type Tab = 'cours' | 'quiz'

const CATEGORY_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  C: 'bg-purple-100 text-purple-700',
  'A+C': 'bg-indigo-100 text-indigo-700',
}

export default function AmfGeneralisteThemePage({ params }: Props) {
  const themeId = parseInt(params.themeId, 10)
  const themeFile = getAmfThemeFile('generaliste', themeId)
  const [activeTab, setActiveTab] = useState<Tab>('cours')

  if (!themeFile || isNaN(themeId)) return notFound()

  const { module, questions } = themeFile

  // CourseViewer attend un objet avec .cours — AmfModule est compatible
  const moduleForViewer = module as unknown as Module

  const tabs = [
    { id: 'cours' as Tab, label: 'Cours', icon: BookOpen },
    { id: 'quiz' as Tab, label: `Quiz d'entraînement`, icon: HelpCircle, count: questions.length },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/amf/generaliste" className="inline-flex items-center gap-1.5 text-brand-brown-lighter hover:text-brand-brown text-sm mb-6 transition-colors">
        <ChevronLeft size={16} />AMF Généraliste
      </Link>

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-off-white flex items-center justify-center font-black text-brand-brown shrink-0">
            T{String(themeId).padStart(2, '0')}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className={cn('badge', CATEGORY_COLORS[module.category] ?? 'bg-gray-100 text-gray-600')}>
                Catégorie {module.category}
              </span>
              <span className="badge bg-gray-100 text-gray-600">AMF Généraliste</span>
            </div>
            <h1 className="text-xl font-black text-brand-brown mb-1">{module.label}</h1>
            <div className="flex items-center gap-4 mt-2 flex-wrap text-xs text-brand-brown-lighter">
              <span className="flex items-center gap-1"><BookOpen size={12} />{module.cours.sections.length} sections</span>
              <span className="flex items-center gap-1"><HelpCircle size={12} />{questions.length} questions d'entraînement</span>
              <span>{module.duration}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {tabs.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
              activeTab === id
                ? 'bg-brand-brown text-white shadow-sm'
                : 'bg-white text-brand-brown-lighter border border-gray-200 hover:border-brand-yellow hover:text-brand-brown'
            )}
          >
            <Icon size={15} />
            {label}
            {count !== undefined && (
              <span className={cn('ml-0.5 text-xs px-1.5 py-0.5 rounded-full', activeTab === id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500')}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {activeTab === 'cours' && (
        <CourseViewer module={moduleForViewer} />
      )}
      {activeTab === 'quiz' && (
        <AmfQuizEngine
          questions={questions}
          themeLabel={module.label}
          onComplete={() => {}}
        />
      )}
    </div>
  )
}
