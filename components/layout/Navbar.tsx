'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Layers, Zap, Users, Target, Trophy, Menu, X, LogOut, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getUser, signOut } from '@/lib/supabase'

const NAV_LINKS = [
  { href: '/parcours', label: 'Parcours', icon: Layers },
  { href: '/module', label: 'Modules', icon: BookOpen },
  { href: '/flashcards', label: 'Flashcards', icon: Zap },
  { href: '/positionnement', label: 'Positionnement', icon: Target },
  { href: '/comite', label: 'Mode Comité', icon: Trophy },
  { href: '/binomes', label: 'Binômes', icon: Users },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<{ email?: string | null; id?: string } | null>(null)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    getUser().then((u) => setUser(u))
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    setUser(null)
    setMenuOpen(false)
  }

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled ? 'bg-brand-brown shadow-lg' : 'bg-brand-brown'
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
              <span className="text-brand-brown font-black text-sm">FE</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              FinEduc <span className="text-brand-yellow">Pro</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  pathname?.startsWith(href)
                    ? 'bg-brand-yellow text-brand-brown'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                )}
              >
                <Icon size={15} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <User size={15} className="text-brand-yellow" />
                  <span className="max-w-[140px] truncate">{user.email}</span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm transition-colors"
                >
                  <LogOut size={15} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-brand-yellow text-brand-brown font-semibold rounded-lg text-sm hover:bg-brand-yellow-dark transition-colors"
              >
                Connexion
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-white p-2 rounded-lg hover:bg-white/10"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-brand-brown border-t border-white/10 px-4 py-3 space-y-1 animate-in">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                pathname?.startsWith(href)
                  ? 'bg-brand-yellow text-brand-brown'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-white/10">
            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 text-gray-400 text-sm px-4 py-2"
              >
                <LogOut size={15} />
                Se déconnecter
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-3 bg-brand-yellow text-brand-brown font-semibold rounded-xl text-sm text-center"
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
