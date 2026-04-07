'use client'

import { useState } from 'react'
import { Zap, Filter } from 'lucide-react'
import { ALL_FLASHCARDS, DOMAINS, getDomainIcon, ALL_MODULES } from '@/lib/content'
import FlashcardDeck from '@/components/features/FlashcardDeck'
import { cn } from '@/lib/utils'

export default function FlashcardsPage() {
  const [selectedDomain, setSelectedDomain] = useState<string>('Tous')
  const [selectedModuleId, setSelectedModuleId] = useState<string>('Tous')
  const [started, setStarted] = useState(false)

  const filteredByDomain =
    selectedDomain === 'Tous'
      ? ALL_FLASHCARDS
      : ALL_FLASHCARDS.filter((fc) => {
          const mod = ALL_MODULES.find((m) => m.id === fc.moduleId)
          return mod?.domain === selectedDomain
        })

  const filteredCards =
    selectedModuleId === 'Tous'
      ? filteredByDomain
      : filteredByDomain.filter((fc) => fc.moduleId === selectedModuleId)

  const modulesInDomain =
    selectedDomain === 'Tous'
      ? ALL_MODULES
      : ALL_MODULES.filter((m) => m.domain === selectedDomain)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-brand-brown" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-brown">Flashcards</h1>
            <p className="text-sm text-brand-brown-lighter">
              {ALL_FLASHCARDS.length} cartes · Répétition espacée (SRS)
            </p>
          </div>
        </div>
      </div>

      {!started ? (
        <div className="space-y-6">
          {/* Info SRS */}
          <div className="card p-5 bg-brand-brown text-white">
            <h3 className="font-bold text-brand-yellow mb-2">Comment ça marche ?</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Les flashcards utilisent l&apos;algorithme SM-2 de répétition espacée. Chaque carte
              est planifiée pour la révision au moment optimal, juste avant que vous l&apos;oubliiez.
              Évaluez votre connaissance : <strong className="text-white">Je sais</strong> (revu dans
              plusieurs jours), <strong className="text-white">Hésitant</strong> (demain),{' '}
              <strong className="text-white">À revoir</strong> (aujourd&apos;hui).
            </p>
          </div>

          {/* Filtres */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={16} className="text-brand-yellow" />
              <h3 className="font-semibold text-brand-brown">Sélectionner les cartes</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-brand-brown-lighter mb-1 block">Domaine</label>
                <select
                  value={selectedDomain}
                  onChange={(e) => { setSelectedDomain(e.target.value); setSelectedModuleId('Tous') }}
                  className="input text-sm"
                >
                  <option value="Tous">Tous les domaines ({ALL_FLASHCARDS.length} cartes)</option>
                  {DOMAINS.map((d) => {
                    const count = ALL_FLASHCARDS.filter((fc) => {
                      const m = ALL_MODULES.find((mod) => mod.id === fc.moduleId)
                      return m?.domain === d
                    }).length
                    return (
                      <option key={d} value={d}>
                        {getDomainIcon(d)} {d} ({count} cartes)
                      </option>
                    )
                  })}
                </select>
              </div>

              <div>
                <label className="text-xs text-brand-brown-lighter mb-1 block">Module spécifique</label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  className="input text-sm"
                >
                  <option value="Tous">Tous les modules du domaine</option>
                  {modulesInDomain.map((m) => {
                    const count = ALL_FLASHCARDS.filter((fc) => fc.moduleId === m.id).length
                    return (
                      <option key={m.id} value={m.id}>
                        {m.label} ({count} cartes)
                      </option>
                    )
                  })}
                </select>
              </div>
            </div>

            <div className="mt-4 p-3 bg-brand-yellow-light rounded-xl">
              <p className="text-sm font-semibold text-brand-brown">
                {filteredCards.length} carte{filteredCards.length > 1 ? 's' : ''} sélectionnée{filteredCards.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Domain overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DOMAINS.map((domain) => {
              const count = ALL_FLASHCARDS.filter((fc) => {
                const m = ALL_MODULES.find((mod) => mod.id === fc.moduleId)
                return m?.domain === domain
              }).length
              return (
                <button
                  key={domain}
                  onClick={() => { setSelectedDomain(domain); setSelectedModuleId('Tous') }}
                  className={cn(
                    'card p-3 text-left transition-all',
                    selectedDomain === domain
                      ? 'ring-2 ring-brand-yellow bg-brand-yellow-light'
                      : 'hover:shadow-card-hover'
                  )}
                >
                  <div className="text-xl mb-1">{getDomainIcon(domain)}</div>
                  <div className="text-xs font-semibold text-brand-brown line-clamp-2">{domain}</div>
                  <div className="text-xs text-brand-brown-lighter mt-1">{count} cartes</div>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setStarted(true)}
            disabled={filteredCards.length === 0}
            className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50"
          >
            <Zap size={20} />
            Démarrer la session ({filteredCards.length} cartes)
          </button>
        </div>
      ) : (
        <div>
          <button
            onClick={() => setStarted(false)}
            className="btn-ghost mb-4 text-sm"
          >
            ← Changer les filtres
          </button>
          <FlashcardDeck
            flashcards={filteredCards}
            title={selectedDomain !== 'Tous' ? selectedDomain : 'Toutes les cartes'}
          />
        </div>
      )}
    </div>
  )
}
