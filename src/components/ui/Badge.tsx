interface BadgeProps {
  label: string
  color?: 'green' | 'yellow' | 'red' | 'gray'
}

const colorClasses: Record<string, string> = {
  green: 'bg-brand/10 text-brand ring-brand/20',
  yellow: 'bg-warn/10 text-warn ring-warn/20',
  red: 'bg-destructive/10 text-destructive ring-destructive/20',
  gray: 'bg-muted text-muted-foreground ring-border',
}

function Badge({ label, color = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ring-1 ${colorClasses[color]}`}>
      {label}
    </span>
  )
}

export default Badge