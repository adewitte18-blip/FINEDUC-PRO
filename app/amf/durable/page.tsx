'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight, BookOpen, HelpCircle, Leaf } from 'lucide-react'
import { getAmfModulesByExam } from '@/lib/amf/content'

export default function AmfDurablePage() {
  const modules = getAmfModulesByExam('durable')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <Link href="/amf" className="inline-flex items-center gap-1.5 text-brand-brown-lighter hover:text-brand-brown text-sm mb-6 transition-colors">
        <ChevronLeft size={16} />Retour AMF
      </Link>

      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
          <Leaf size={24} className="text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-brand-brown">AMF Finance Durable</h1>
          <p className="text-brand-brown-lighter text-sm mt-1">
            5 thèmes · Catégorie C · Seuil : ≥ 80 % global
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={`/amf/durable/${mod.theme_id}`}
            className="card p-5 flex items-center gap-4 hover:ring-1 hover:ring-brand-yellow/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center font-black text-green-700 text-sm shrink-0">
              T{String(mod.theme_id).padStart(2, '0')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                  Catégorie C
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
        <Link href="/amf/examen?exam=durable" className="btn-primary">
          Passer l'examen blanc
        </Link>
      </div>
    </div>
  )
}
