import type { DashboardSummary } from '../types/dashboard'
import { AlertTriangle } from 'lucide-react'

interface ComplianceAlertsProps {
  documents: DashboardSummary['compliance']['upcoming']
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  const now = new Date()
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

function entityLabel(type: string, id: number): string {
  const short = type.split('\\').pop()
  return `${short} #${id}`
}

function ComplianceAlerts({ documents }: ComplianceAlertsProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle size={18} className="text-yellow-500" />
        <h3 className="font-bold text-gray-800">Upcoming Compliance Deadlines</h3>
      </div>

      {documents.length === 0 ? (
        <p className="text-sm text-gray-400">Nothing expiring soon.</p>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const days = daysUntil(doc.expiry_date)
            return (
              <div key={doc.id} className="flex items-center justify-between text-sm border-b border-gray-50 pb-2 last:border-0">
                <div>
                  <p className="font-medium text-gray-700">{doc.document_type}</p>
                  <p className="text-xs text-gray-400">{entityLabel(doc.documentable_type, doc.documentable_id)}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${days <= 7 ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-700'}`}>
                  {days} day{days !== 1 ? 's' : ''}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ComplianceAlerts