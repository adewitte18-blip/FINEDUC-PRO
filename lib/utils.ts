import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(duration: string): string {
  return duration.replace('h', 'h de contenu')
}

export function getProgressPercent(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function scoreToGrade(score: number): { grade: string; color: string } {
  if (score >= 80) return { grade: 'Excellent', color: 'text-green-600' }
  if (score >= 60) return { grade: 'Bien', color: 'text-yellow-600' }
  if (score >= 40) return { grade: 'À revoir', color: 'text-orange-600' }
  return { grade: 'Insuffisant', color: 'text-red-600' }
}
