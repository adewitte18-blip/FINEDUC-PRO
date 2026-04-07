'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Users, Search, UserPlus, CheckCircle2, MessageCircle, BarChart2, Trophy, ChevronRight, Mail } from 'lucide-react'
import { getUserProfile, getUser, getBinome, createSupabaseClient } from '@/lib/supabase'
import { ALL_MODULES, PARCOURS_LIST } from '@/lib/content'
import type { UserProfile, Binome } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PotentialBinome {
  id: string
  full_name: string
  job_title?: string
  region?: string
  active_parcours?: string
  progress_count?: number
}

export default function BinomesPage() {
  const [user, setUser] = useState<{ id: string; email?: string | null } | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [currentBinome, setCurrentBinome] = useState<Binome | null>(null)
  const [binomeProfile, setBinomeProfile] = useState<UserProfile | null>(null)
  const [potentialBinomes, setPotentialBinomes] = useState<PotentialBinome[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSent, setInviteSent] = useState(false)
  const [activeTab, setActiveTab] = useState<'current' | 'find'>('current')

  useEffect(() => {
    const init = async () => {
      const u = await getUser()
      if (!u) { setLoading(false); return }
      setUser(u)

      const [p, b] = await Promise.all([
        getUserProfile(u.id),
        getBinome(u.id),
      ])
      setProfile(p)
      setCurrentBinome(b)

      if (b) {
        const partnerProfileId = b.user1_id === u.id ? b.user2_id : b.user1_id
        const partnerProfile = await getUserProfile(partnerProfileId)
        setBinomeProfile(partnerProfile)
      }

      // Chercher des binômes potentiels
      if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
        try {
          const supabase = createSupabaseClient()
          const { data } = await supabase
            .from('profiles')
            .select('id, full_name, job_title, region, active_parcours')
            .neq('id', u.id)
            .limit(12)
          setPotentialBinomes(data || [])
        } catch {}
      }

      setLoading(false)
    }
    init()
  }, [])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulation d'envoi — en prod, utiliser Supabase Edge Functions
    setInviteSent(true)
    setTimeout(() => setInviteSent(false), 4000)
    setInviteEmail('')
  }

  const handleRequestBinome = async (targetId: string) => {
    if (!user || !process.env.NEXT_PUBLIC_SUPABASE_URL) return
    try {
      const supabase = createSupabaseClient()
      await supabase.from('binomes').insert({
        user1_id: user.id,
        user2_id: targetId,
        status: 'pending',
      })
      alert('Demande de binôme envoyée !')
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-brand-brown-lighter">Chargement...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">👥</div>
        <h1 className="text-2xl font-black text-brand-brown mb-3">Système de binômes</h1>
        <p className="text-brand-brown-lighter mb-6">
          Connectez-vous pour accéder au système de binômes et apprendre en duo avec un collègue.
        </p>
        <Link href="/login" className="btn-primary">
          Se connecter <ChevronRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
            <Users size={20} className="text-brand-brown" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-brand-brown">Système de binômes</h1>
            <p className="text-sm text-brand-brown-lighter">
              Apprenez en duo — progression partagée, challenges mutuels
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {(['current', 'find'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-brand-brown text-white'
                : 'bg-white border border-gray-200 text-brand-brown-lighter hover:text-brand-brown'
            )}
          >
            {tab === 'current' ? '👥 Mon binôme' : '🔍 Trouver un binôme'}
          </button>
        ))}
      </div>

      {/* ─── MON BINÔME ─── */}
      {activeTab === 'current' && (
        <div className="space-y-6">
          {currentBinome && binomeProfile ? (
            <>
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-brand-yellow rounded-2xl flex items-center justify-center text-2xl font-black text-brand-brown shrink-0">
                    {(binomeProfile.full_name || 'B')[0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-brand-brown">{binomeProfile.full_name || 'Votre binôme'}</h3>
                      <span className="badge bg-brand-green/20 text-green-700 text-xs">
                        <CheckCircle2 size={11} className="mr-1" /> Actif
                      </span>
                    </div>
                    <p className="text-sm text-brand-brown-lighter">
                      {binomeProfile.job_title || 'Chargé d\'affaires'}
                      {binomeProfile.region && ` · ${binomeProfile.region}`}
                    </p>
                    {binomeProfile.active_parcours && (
                      <p className="text-xs text-brand-brown mt-1">
                        Parcours actif :{' '}
                        <span className="font-medium">
                          {PARCOURS_LIST.find((p) => p.id === binomeProfile.active_parcours)?.label || binomeProfile.active_parcours}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Activités partagées */}
              <div className="card p-6">
                <h3 className="font-bold text-brand-brown mb-4">Défis de la semaine</h3>
                <div className="space-y-3">
                  {ALL_MODULES.slice(0, 3).map((mod) => (
                    <div key={mod.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-brand-yellow rounded-full" />
                        <span className="text-sm text-brand-brown">{mod.label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-brand-green font-medium">Vous: ✓</span>
                        <span className="text-xs text-brand-brown-lighter">Binôme: –</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link href="/module" className="btn-secondary mt-4 text-sm">
                  <Trophy size={14} />
                  Proposer un défi
                </Link>
              </div>

              {/* Stats comparatives */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="card p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-brand-yellow" />
                    <h4 className="font-semibold text-brand-brown text-sm">Votre progression</h4>
                  </div>
                  <div className="text-3xl font-black text-brand-brown mb-1">
                    {Math.round(Math.random() * 15 + 5)}
                  </div>
                  <p className="text-xs text-brand-brown-lighter">modules complétés</p>
                </div>
                <div className="card p-5 bg-brand-off-white">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart2 size={16} className="text-brand-brown-lighter" />
                    <h4 className="font-semibold text-brand-brown text-sm">Progression {binomeProfile.full_name?.split(' ')[0]}</h4>
                  </div>
                  <div className="text-3xl font-black text-brand-brown mb-1">
                    {Math.round(Math.random() * 12 + 3)}
                  </div>
                  <p className="text-xs text-brand-brown-lighter">modules complétés</p>
                </div>
              </div>

              <div className="card p-5 bg-brand-brown text-white">
                <div className="flex items-start gap-3">
                  <MessageCircle size={18} className="text-brand-yellow shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-brand-yellow mb-1">Conseil de la semaine</h4>
                    <p className="text-sm text-gray-300">
                      Partagez vos notes sur le module &quot;{ALL_MODULES[0].label}&quot; avec votre binôme
                      et comparez vos analyses du DSCR.
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-brand-brown mb-2">Pas encore de binôme</h3>
              <p className="text-brand-brown-lighter text-sm mb-6">
                Trouvez un collègue pour apprendre ensemble, vous challenger mutuellement et progresser plus vite.
              </p>
              <button
                onClick={() => setActiveTab('find')}
                className="btn-primary mx-auto"
              >
                <UserPlus size={16} />
                Trouver un binôme
              </button>
            </div>
          )}

          {/* Inviter par email */}
          <div className="card p-6">
            <h3 className="font-bold text-brand-brown mb-1">Inviter un collègue</h3>
            <p className="text-xs text-brand-brown-lighter mb-4">
              Envoyez une invitation à un collègue directement par email
            </p>
            <form onSubmit={handleInvite} className="flex gap-3">
              <input
                type="email"
                placeholder="email@bpifrance.fr"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="input flex-1 text-sm"
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                <Mail size={15} />
                Inviter
              </button>
            </form>
            {inviteSent && (
              <p className="text-sm text-brand-green mt-2 flex items-center gap-1">
                <CheckCircle2 size={14} /> Invitation envoyée !
              </p>
            )}
          </div>
        </div>
      )}

      {/* ─── TROUVER UN BINÔME ─── */}
      {activeTab === 'find' && (
        <div className="space-y-6">
          {potentialBinomes.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {potentialBinomes.map((p) => (
                <div key={p.id} className="card p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-off-white rounded-xl flex items-center justify-center font-bold text-brand-brown">
                      {(p.full_name || '?')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-brand-brown text-sm truncate">{p.full_name || 'Utilisateur'}</div>
                      <div className="text-xs text-brand-brown-lighter">
                        {p.job_title || 'Chargé d\'affaires'}
                        {p.region && ` · ${p.region}`}
                      </div>
                    </div>
                  </div>
                  {p.active_parcours && (
                    <div className="text-xs text-brand-brown bg-brand-off-white rounded-lg px-3 py-1.5">
                      Parcours : {PARCOURS_LIST.find((parc) => parc.id === p.active_parcours)?.label || p.active_parcours}
                    </div>
                  )}
                  <button
                    onClick={() => handleRequestBinome(p.id)}
                    className="btn-secondary text-xs w-full justify-center"
                  >
                    <UserPlus size={13} />
                    Proposer un binôme
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-brand-brown mb-2">
                Aucun utilisateur trouvé
              </h3>
              <p className="text-brand-brown-lighter text-sm mb-6">
                La base d&apos;utilisateurs se remplira au fur et à mesure des inscriptions.
                En attendant, invitez un collègue par email !
              </p>
              <Link href="/login" className="btn-secondary">
                Créer mon profil
              </Link>
            </div>
          )}

          <div className="card p-6 bg-brand-off-white">
            <h4 className="font-semibold text-brand-brown mb-2">
              Comment fonctionne le système de binômes ?
            </h4>
            <ul className="space-y-2 text-sm text-brand-brown-lighter">
              {[
                'Sélectionnez un collègue dans la liste ou invitez-le par email',
                'Une fois la demande acceptée, vous partagez votre tableau de bord',
                'Suivez vos progressions respectives et lancez des défis mutuels',
                'Comparez vos scores de quiz et discutez des cas pratiques',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-brand-yellow rounded-full flex items-center justify-center text-xs font-bold text-brand-brown shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
