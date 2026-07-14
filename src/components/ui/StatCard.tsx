import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  accent?: 'blue' | 'green' | 'yellow' | 'red'
  subtext?: string
}

const accentStyles: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
}

function StatCard({ label, value, icon: Icon, accent = 'blue', subtext }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
          {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${accentStyles[accent]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  )
}

export default StatCard