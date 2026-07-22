import type { Driver } from '../types/employee'
import Badge from './ui/Badge'
import { getExpiryStatus } from '../utils/documentHelpers'
import { DRIVER_DOCUMENT_TYPES } from '../constants/employeeCompliance'
import { Pencil, Trash2 } from 'lucide-react'

interface DriverTableProps {
  drivers: Driver[]
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

const expiryColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  valid: 'green',
  'expiring-soon': 'yellow',
  expired: 'red',
  unknown: 'gray',
}

function DriverTable({ drivers, onEdit, onDelete }: DriverTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Phone Number</th>
            {DRIVER_DOCUMENT_TYPES.map(({ key, label }) => (
              <th key={key} className="px-4 py-3">{label}</th>
            ))}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {drivers.map((driver) => (
            <tr key={driver.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{driver.full_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{driver.phone ?? '—'}</td>
              {DRIVER_DOCUMENT_TYPES.map(({ key }) => {
                const doc = driver.documents.find((d) => d.document_type === key)
                const status = doc ? getExpiryStatus(doc) : 'unknown'
                return (
                  <td key={key} className="px-4 py-3">
                    <Badge label={doc?.expiry_date?.slice(0, 10) ?? '—'} color={expiryColors[status]} />
                  </td>
                )
              })}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(driver)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit driver">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(driver)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete driver">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {drivers.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No drivers added yet. Click "Add Driver" to get started.</div>
      )}
    </div>
  )
}

export default DriverTable