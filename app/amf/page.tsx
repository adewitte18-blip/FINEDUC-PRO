'use client'

import Link from 'next/link'
import { GraduationCap, BookOpen, ClipboardList, ArrowRight, Shield, Leaf } from 'lucide-react'
import { AMF_PARCOURS } from '@/lib/amf/content'

export default function AmfPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
            <GraduationCap size={22} className="text-brand-brown" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-brown">Certifications AMF</h1>
            <p className="text-brand-brown-lighter text-sm">Préparez vos examens réglementaires</p>
          </div>
        </div>
      </div>

      {/* Parcours cards */}
      <div className="grid sm:grid-cols-2 gap-6 mb-8">
        {/* AMF Généraliste */}
        <div className="card p-6 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-brand-yellow/20 flex items-center justify-center mb-4">
            <Shield size={24} className="text-brand-brown" />
          </div>
          <h2 className="text-xl font-black text-brand-brown mb-2">AMF Généraliste</h2>
          <p className="text-sm text-brand-brown-lighter mb-4 flex-1">
            Certification obligatoire pour les fonctions de vendeur au sein d'un PSI. 12 thèmes couvrant le cadre réglementaire, la déontologie, LCB-FT, MAR, les instruments financiers et les marchés.
          </p>
          <div className="flex items-center gap-3 text-xs text-brand-brown-lighter mb-5 flex-wrap">
            <span className="flex items-center gap-1">📋 120 questions</span>
            <span className="flex items-center gap-1">⏱ 2h d'examen</span>
            <span className="flex items-center gap-1">🎯 ≥ 80 % en A ET C</span>
          </div>
          <div className="flex gap-2 flex-col">
            <Link href="/amf/generaliste" className="btn-primary justify-center text-center">
              <BookOpen size={16} />Modules de cours
            </Link>
            <Link href="/amf/examen?exam=generaliste" className="btn-secondary justify-center text-center">
              <ClipboardList size={16} />Passer l'examen blanc
            </Link>
          </div>
        </div>

        {/* AMF Finance Durable */}
        <div className="card p-6 flex flex-col">
          <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center mb-4">
            <Leaf size={24} className="text-green-600" />
          </div>
          <h2 className="text-xl font-black text-brand-brown mb-2">AMF Finance Durable</h2>
          <p className="text-sm text-brand-brown-lighter mb-4 flex-1">
            Certification optionnelle sur la finance durable. 5 thèmes couvrant ESG, SFDR, Taxonomie, CSRD, labels ISR et commercialisation des produits durables.
          </p>
          <div className="flex items-center gap-3 text-xs text-brand-brown-lighter mb-5 flex-wrap">
            <span className="flex items-center gap-1">📋 60 questions</span>
            <span className="flex items-center gap-1">⏱ 1h d'examen</span>
            <span className="flex items-center gap-1">🌿 ≥ 80 % global</span>
          </div>
          <div className="flex gap-2 flex-col">
            <Link href="/amf/durable" className="btn-primary justify-center text-center">
              <BookOpen size={16} />Modules de cours
            </Link>
            <Link href="/amf/examen?exam=durable" className="btn-secondary justify-center text-center">
              <ClipboardList size={16} />Passer l'examen blanc
            </Link>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="card p-5 bg-brand-off-white border border-brand-yellow/30">
        <h3 className="font-bold text-brand-brown mb-3 flex items-center gap-2">
          <GraduationCap size={16} className="text-brand-yellow" />
          Comment se préparer ?
        </h3>
        <ol className="space-y-2 text-sm text-brand-brown-lighter">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center text-brand-brown font-bold text-xs shrink-0 mt-0.5">1</span>
            Suivez les <strong className="text-brand-brown">modules de cours</strong> dans l'ordre — chaque thème a une fiche pédagogique + quiz d'entraînement.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center text-brand-brown font-bold text-xs shrink-0 mt-0.5">2</span>
            Faites des <strong className="text-brand-brown">examens blancs</strong> en conditions réelles (timer, sans correction immédiate).
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center text-brand-brown font-bold text-xs shrink-0 mt-0.5">3</span>
            Revisitez les thèmes faibles grâce à l'analyse détaillée des résultats.
          </li>
        </ol>
      </div>
    </div>
  )
}
