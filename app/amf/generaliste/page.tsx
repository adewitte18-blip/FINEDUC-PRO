'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, Shield } from 'lucide-react'
import { getAmfModulesByExam } from '@/lib/amf/content'
import { cn } from '@/lib/utils'

const CATEGORY_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700',
  C: 'bg-purple-100 text-purple-700',
  'A+C': 'bg-indigo-100 text-indigo-700',
}

export default function AmfGeneralistePage() {
  const modules = getAmfModulesByExam('generaliste')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/amf" className="inline-flex items-center gap-1.5 text-brand-brown-lighter hover:text-brand-brown text-sm mb-6 transition-colors">
        <ChevronLeft size={16} />Retour AMF
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center shrink-0">
          <Shield size={24} className="text-brand-brown" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-brand-brown">AMF Généraliste</h1>
          <p className="text-brand-brown-lighter text-sm mt-1">
            12 thèmes · Catégories A (déontologie) et C (technique) · Seuil : ≥ 80 % en A ET ≥ 80 % en C
          </p>
        </div>
      </div>

      <div className="flex gap-3 mb-6 flex-wrap">
        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-blue-500" />Catégorie A — Déontologie & réglementation
        </span>
        <span className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-purple-100 text-purple-700 font-medium">
          <span className="w-2 h-2 rounded-full bg-purple-500" />Catégorie C — Connaissances techniques
        </span>
      </div>

      <div className="space-y-3">
        {modules.map((mod, idx) => (
          <Link
            key={mod.id}
            href={`/amf/generaliste/${mod.theme_id}`}
            className="card p-5 flex items-center gap-4 hover:ring-1 hover:ring-brand-yellow/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-off-white flex items-center justify-center font-black text-brand-brown text-sm shrink-0">
              T{String(mod.theme_id).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', CATEGORY_COLORS[mod.category] ?? 'bg-gray-100 text-gray-600')}>
                  {mod.category}
                </span>
                <h3 className="font-semibold text-brand-brown text-sm">{mod.label}</h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-brown-lighter">
                <span className="flex items-center gap-1"><BookOpen size={11} />{mod.cours.sections.length} sections</span>
                <span className="flex items-center gap-1"><HelpCircle size={11} />Quiz d'entraînement</span>
                <span>{mod.duration}</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-brand-brown-lighter shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        ))}
      </div>

      <div className="mt-8 flex gap-3">
        <Link href="/amf/examen?exam=generaliste" className="btn-primary">
          Passer l'examen blanc
        </Link>
      </div>
    </div>
  )
}
