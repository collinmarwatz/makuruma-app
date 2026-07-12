interface BadgeProps {
  label: string
  color?: 'green' | 'yellow' | 'red' | 'gray'
}

function Badge({ label, color = 'gray' }: BadgeProps) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-700',
  }

  return (
    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
      {label}
    </span>
  )
}

export default Badge