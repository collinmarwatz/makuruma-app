import type { LucideIcon } from 'lucide-react'
import { AlertTriangle } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  sub: string
  icon: LucideIcon
  tone?: 'brand' | 'warn' | 'destructive' | 'muted'
  badge?: { label: string }
  wide?: boolean
}

const toneClasses: Record<string, string> = {
  brand: 'bg-brand/10 text-brand ring-brand/20',
  warn: 'bg-warn/10 text-warn ring-warn/20',
  destructive: 'bg-destructive/10 text-destructive ring-destructive/20',
  muted: 'bg-muted text-muted-foreground ring-border',
}

function StatCard({ label, value, sub, icon: Icon, tone = 'muted', badge, wide }: StatCardProps) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl bg-card p-5 ring-1 ring-white/5 transition-colors hover:ring-white/10 ${
        wide ? 'sm:col-span-2 lg:col-span-2' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="flex h-5 items-center bg-destructive/10 px-2 ring-1 ring-destructive/20 rounded">
              <AlertTriangle className="mr-1 size-3 text-destructive" />
              <span className="text-[10px] font-bold text-destructive">{badge.label}</span>
            </span>
          )}
          <div className={`grid size-7 place-items-center rounded ring-1 ${toneClasses[tone]}`}>
            <Icon className="size-3.5" />
          </div>
        </div>
      </div>
      <p className="mt-3 text-3xl font-medium tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}

export default StatCard