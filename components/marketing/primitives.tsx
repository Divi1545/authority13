import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type SectionShellProps = {
  children: ReactNode
  className?: string
}

export function SectionShell({ children, className }: SectionShellProps) {
  return <section className={cn('container mx-auto px-4 py-16 md:py-20', className)}>{children}</section>
}

type GlassCardProps = {
  children: ReactNode
  className?: string
}

export function GlassCard({ children, className }: GlassCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/60 bg-white/70 shadow-[0_12px_40px_rgba(15,23,42,0.08)] backdrop-blur-md',
        'transition-all duration-300 will-change-transform',
        'hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.14)] hover:border-sky-200/80',
        className
      )}
    >
      {children}
    </div>
  )
}

type GradientOrbProps = {
  className?: string
}

export function GradientOrb({ className }: GradientOrbProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute rounded-full blur-3xl opacity-50',
        'bg-gradient-to-br from-sky-300/60 via-indigo-300/50 to-violet-300/60',
        className
      )}
    />
  )
}
