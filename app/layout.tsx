import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'

export const metadata: Metadata = {
  title: 'FinEduc Pro — Formation Finance Bancaire Bpifrance',
  description:
    'Plateforme d\'e-learning professionnelle pour chargés d\'affaires Bpifrance. 31 modules · Quiz · Flashcards · Cas pratiques.',
  keywords: 'finance bancaire, formation, Bpifrance, crédit, analyse financière, e-learning',
  openGraph: {
    title: 'FinEduc Pro',
    description: 'Formation Finance Bancaire — 31 modules professionnels',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
      </body>
    </html>
  )
}
