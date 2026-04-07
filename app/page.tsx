'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Zap, Target, Trophy, Users, ChevronRight, TrendingUp, Clock, CheckCircle2, Star } from 'lucide-react'
import { ALL_MODULES, PARCOURS_LIST, getDomainIcon, getLevelColor } from '@/lib/content'
import { getUserProgress, getUser } from '@/lib/supabase'
import type { UserProgress } from '@/lib/types'
import { cn } from '@/lib/utils'

const FEATURES = [
  { icon: Target, label: 'Test de positionnement', desc: '12 questions pour évaluer votre niveau', href: '/positionnement', color: 'bg-brand-yellow' },
  { icon: BookOpen, label: '31 modules complets', desc: 'Cours, quiz, cas pratiques intégrés', href: '/module', color: 'bg-brand-green' },
  { icon: Zap, label: 'Flashcards SRS', desc: 'Répétition espacée intelligente', href: '/flashcards', color: 'bg-blue-400' },
  { icon: Trophy, label: 'Mode Comité', desc: 'Simulez un passage en comité', href: '/comite', color: 'bg-orange-400' },
  { icon: Users, label: 'Système de binômes', desc: 'Apprenez en équipe', href: '/binomes', color: 'bg-purple-400' },
  { icon: TrendingUp, label: 'Parcours guidés', desc: '7 parcours thématiques structurés', href: '/parcours', color: 'bg-rose-400' },
]

export default function HomePage() {
  const [progress, setProgress] = useState<UserProgress[]>([])
  const [userName, setUserName] = useState<string | null>(null)

  useEffect(() => {
    getUser().then((u) => {
      if (u) {
        setUserName(u.user_metadata?.full_name || u.email?.split('@')[0] || null)
        getUserProgress(u.id).then(setProgress)
      } else {
        getUserProgress('').then(setProgress)
      }
    })
  }, [])

  const completedCount = progress.filter((p) => p.status === 'completed').length
  const inProgressCount = progress.filter((p) => p.status === 'in_progress').length
  const totalPercent = Math.round((completedCount / ALL_MODULES.length) * 100)

  // Derniers modules visités
  const recentModules = ALL_MODULES
    .filter((m) => progress.some((p) => p.module_id === m.id))
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-brown to-[#2a2420]">
      {/* Hero */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-brand-yellow blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-brand-green blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Star size={14} />
            31 modules · Finance bancaire Bpifrance
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            {userName ? (
              <>
                Bonjour{' '}
                <span className="text-brand-yellow">{userName}</span> 👋
              </>
            ) : (
              <>
                Montez en compétence.{' '}
                <span className="text-brand-yellow">Rapidement.</span>
              </>
            )}
          </h1>
          <p className="text-gray-300 text-lg sm:text-xl max-w-2xl mx-auto mb-10">
            La plateforme de formation des chargés d&apos;affaires Bpifrance. Analyse financière,
            financement sectoriel, DeFi, soft skills — tout en un.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/positionnement" className="btn-primary text-base px-7 py-3.5">
              <Target size={18} />
              Commencer le test de positionnement
            </Link>
            <Link href="/parcours" className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white font-medium rounded-xl hover:bg-white/10 transition-all">
              <BookOpen size={18} />
              Explorer les parcours
            </Link>
          </div>
        </div>
      </section>

      {/* Progression (si données) */}
      {progress.length > 0 && (
        <section className="px-4 sm:px-6 pb-8">
          <div className="max-w-4xl mx-auto">
            <div className="card p-6 grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-black text-brand-yellow">{completedCount}</div>
                <div className="text-sm text-gray-500 mt-1">Modules terminés</div>
              </div>
              <div>
                <div className="text-3xl font-black text-brand-green">{inProgressCount}</div>
                <div className="text-sm text-gray-500 mt-1">En cours</div>
              </div>
              <div>
                <div className="text-3xl font-black text-brand-brown">{totalPercent}%</div>
                <div className="text-sm text-gray-500 mt-1">Progression globale</div>
              </div>
              <div className="col-span-3">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${totalPercent}%` }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* White section */}
      <div className="bg-brand-cream rounded-t-3xl">
        {/* Features grid */}
        <section className="px-4 sm:px-6 pt-12 pb-8 max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-brand-brown mb-2 text-center">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-center text-brand-brown-lighter mb-8">
            6 fonctionnalités pensées pour la progression professionnelle
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {FEATURES.map(({ icon: Icon, label, desc, href, color }) => (
              <Link key={href} href={href} className="card-hover p-5 group">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', color)}>
                  <Icon size={20} className="text-white" />
                </div>
                <div className="font-semibold text-brand-brown text-sm mb-1">{label}</div>
                <div className="text-xs text-brand-brown-lighter">{desc}</div>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-brand-brown-lighter group-hover:text-brand-brown transition-colors">
                  Accéder <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Modules récents / tous les modules */}
        <section className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-brown">
              {recentModules.length > 0 ? 'Récemment visités' : 'Modules populaires'}
            </h2>
            <Link href="/module" className="text-sm text-brand-brown-lighter hover:text-brand-brown flex items-center gap-1">
              Voir tout <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {(recentModules.length > 0 ? recentModules : ALL_MODULES.filter((m) => m.tag === 'Fondamental' || m.tag === 'Prioritaire').slice(0, 3)).map((mod) => {
              const prog = progress.find((p) => p.module_id === mod.id)
              return (
                <Link key={mod.id} href={`/module/${mod.id}`} className="card-hover p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-2xl">{getDomainIcon(mod.domain)}</span>
                    {prog?.status === 'completed' && (
                      <CheckCircle2 size={18} className="text-brand-green shrink-0" />
                    )}
                  </div>
                  <div className="font-semibold text-brand-brown text-sm mb-1 line-clamp-2">{mod.label}</div>
                  <div className="text-xs text-brand-brown-lighter mb-3">{mod.domain}</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('badge text-xs', getLevelColor(mod.level))}>{mod.level}</span>
                    <span className="flex items-center gap-1 text-xs text-brand-brown-lighter">
                      <Clock size={11} />{mod.duration}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Parcours highlight */}
        <section className="px-4 sm:px-6 py-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-brown">Parcours guidés</h2>
            <Link href="/parcours" className="text-sm text-brand-brown-lighter hover:text-brand-brown flex items-center gap-1">
              Tous les parcours <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PARCOURS_LIST.slice(0, 3).map((p) => (
              <Link key={p.id} href={`/parcours#${p.id}`} className="card-hover p-5 border-l-4" style={{ borderLeftColor: p.color }}>
                <div className="text-2xl mb-2">{p.icon}</div>
                <div className="font-bold text-brand-brown mb-1">{p.label}</div>
                <div className="text-xs text-brand-brown-lighter mb-3 line-clamp-2">{p.description}</div>
                <div className="flex items-center gap-3 text-xs text-brand-brown-lighter">
                  <span>{p.moduleIds.length} modules</span>
                  <span>·</span>
                  <span>{p.estimatedHours}h</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA final */}
        <section className="px-4 sm:px-6 py-12 max-w-2xl mx-auto text-center">
          <div className="card p-8 bg-brand-brown text-white rounded-2xl">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2">Pas encore de compte ?</h3>
            <p className="text-gray-300 text-sm mb-6">
              Créez votre profil pour synchroniser votre progression et accéder au système de binômes.
            </p>
            <Link href="/login" className="btn-primary w-full justify-center">
              Créer un compte gratuitement
            </Link>
            <p className="text-gray-500 text-xs mt-3">
              Sans compte : progression sauvegardée en local dans votre navigateur
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
