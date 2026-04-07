'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react'
import { signIn, signUp } from '@/lib/supabase'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'register'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) throw error
        router.push('/')
      } else {
        const { error } = await signUp(email, password, fullName)
        if (error) throw error
        setSuccess('Compte créé ! Vérifiez votre email pour confirmer votre inscription.')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-br from-brand-cream to-brand-off-white">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-yellow rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-brand-brown font-black text-xl">FE</span>
          </div>
          <h1 className="text-2xl font-black text-brand-brown">FinEduc Pro</h1>
          <p className="text-brand-brown-lighter text-sm mt-1">
            {mode === 'login' ? 'Connectez-vous à votre compte' : 'Créez votre compte gratuitement'}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-brand-off-white rounded-xl p-1 mb-6">
          {(['login', 'register'] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); setSuccess('') }}
              className={cn(
                'flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all',
                mode === m
                  ? 'bg-white text-brand-brown shadow-sm'
                  : 'text-brand-brown-lighter hover:text-brand-brown'
              )}
            >
              {m === 'login' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        {/* Form */}
        <div className="card p-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl text-sm mb-4">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-600 rounded-xl text-sm mb-4">
              <CheckCircle2 size={16} className="shrink-0" />
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-xs font-medium text-brand-brown mb-1 block">Prénom & Nom</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Marie Dupont"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="input pl-9"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium text-brand-brown mb-1 block">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="marie.dupont@bpifrance.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="input pl-9"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-brand-brown mb-1 block">Mot de passe</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? 'Minimum 8 caractères' : '••••••••'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === 'register' ? 8 : undefined}
                  className="input pl-9 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-brown"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-brand-brown border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Connexion...' : 'Création...'}
                </span>
              ) : (
                mode === 'login' ? 'Se connecter' : 'Créer mon compte'
              )}
            </button>
          </form>

          {mode === 'login' && (
            <p className="text-center text-xs text-brand-brown-lighter mt-4">
              Pas encore de compte ?{' '}
              <button onClick={() => setMode('register')} className="text-brand-brown underline">
                S&apos;inscrire gratuitement
              </button>
            </p>
          )}
        </div>

        {/* Mode hors-ligne */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-brand-brown-lighter hover:text-brand-brown">
            Continuer sans compte (progression locale)
          </Link>
        </div>

        {/* Features sans compte */}
        <div className="card p-4 mt-6 bg-brand-off-white">
          <p className="text-xs font-medium text-brand-brown mb-2">
            Sans compte, vous avez accès à :
          </p>
          <ul className="space-y-1">
            {[
              '✅ Tous les 31 modules de cours',
              '✅ Quiz et cas pratiques',
              '✅ Flashcards (SRS local)',
              '✅ Mode Comité',
              '❌ Synchronisation multi-appareils',
              '❌ Système de binômes',
            ].map((item, i) => (
              <li key={i} className="text-xs text-brand-brown-lighter">{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
