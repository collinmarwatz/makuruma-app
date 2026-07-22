import type { Trailer } from '../types/trailer'
import Badge from './ui/Badge'
import { getExpiryStatus } from '../utils/documentHelpers'
import { TRAILER_COMPLIANCE_TYPES } from '../constants/compliance'
import { Pencil, Trash2 } from 'lucide-react'

interface TrailerTableProps {
  trailers: Trailer[]
  onEdit: (trailer: Trailer) => void
  onDelete: (trailer: Trailer) => void
}

const expiryColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  valid: 'green',
  'expiring-soon': 'yellow',
  expired: 'red',
  unknown: 'gray',
}

function TrailerTable({ trailers, onEdit, onDelete }: TrailerTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Reg No</th>
            {TRAILER_COMPLIANCE_TYPES.map(({ key, label }) => (
              <th key={key} className="px-4 py-3">{label}</th>
            ))}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {trailers.map((trailer) => (
            <tr key={trailer.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{trailer.reg_no}</td>
              {TRAILER_COMPLIANCE_TYPES.map(({ key }) => {
                const doc = trailer.documents.find((d) => d.document_type === key)
                const status = doc ? getExpiryStatus(doc) : 'unknown'
                return (
                  <td key={key} className="px-4 py-3">
                    <Badge label={doc?.expiry_date?.slice(0, 10) ?? '—'} color={expiryColors[status]} />
                  </td>
                )
              })}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(trailer)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit trailer">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(trailer)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete trailer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {trailers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No trailers added yet. Click "Add Trailer" to get started.</div>
      )}
    </div>
  )
}

export default TrailerTable