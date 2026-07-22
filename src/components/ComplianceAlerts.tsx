import type { DashboardSummary } from '../types/dashboard'

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
  if (documents.length === 0) {
    return <p className="text-xs italic text-muted-foreground">Nothing expiring soon.</p>
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => {
        const days = daysUntil(doc.expiry_date)
        return (
          <div key={doc.id} className="flex items-center justify-between text-sm border-b border-hairline pb-2 last:border-0">
            <div>
              <p className="font-medium text-foreground">{doc.document_type}</p>
              <p className="text-xs text-muted-foreground">{entityLabel(doc.documentable_type, doc.documentable_id)}</p>
            </div>
            <span
              className={`text-xs font-medium px-2 py-1 rounded-full ring-1 ${
                days <= 7
                  ? 'bg-destructive/10 text-destructive ring-destructive/20'
                  : 'bg-warn/10 text-warn ring-warn/20'
              }`}
            >
              {days} day{days !== 1 ? 's' : ''}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default ComplianceAlerts