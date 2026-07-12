import type { Truck } from '../types/truck'
import Badge from './ui/Badge'
import { getExpiryStatus } from '../utils/documentHelpers'
import { TRUCK_COMPLIANCE_TYPES } from '../constants/compliance'
import { Pencil, Trash2 } from 'lucide-react'

interface TruckTableProps {
  trucks: Truck[]
  onEdit: (truck: Truck) => void
  onDelete: (truck: Truck) => void
}

const expiryColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  valid: 'green',
  'expiring-soon': 'yellow',
  expired: 'red',
  unknown: 'gray',
}

function TruckTable({ trucks, onEdit, onDelete }: TruckTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Reg No</th>
            <th className="px-4 py-3">Capacity</th>
            <th className="px-4 py-3">Trailer</th>
            <th className="px-4 py-3">Driver</th>
            {TRUCK_COMPLIANCE_TYPES.map(({ key, label }) => (
              <th key={key} className="px-4 py-3">{label}</th>
            ))}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trucks.map((truck) => (
            <tr key={truck.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{truck.reg_no}</td>
              <td className="px-4 py-3 text-gray-600">{truck.capacity} tons</td>
              <td className="px-4 py-3 text-gray-600">{truck.trailer?.reg_no ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{truck.driver?.full_name ?? '—'}</td>
              {TRUCK_COMPLIANCE_TYPES.map(({ key }) => {
                const doc = truck.documents.find((d) => d.document_type === key)
                const status = doc ? getExpiryStatus(doc) : 'unknown'
                return (
                  <td key={key} className="px-4 py-3">
                    <Badge label={doc?.expiry_date?.slice(0, 10) ?? '—'} color={expiryColors[status]} />
                  </td>
                )
              })}
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(truck)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit truck"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(truck)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete truck"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {trucks.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          No trucks added yet. Click "Add Truck" to get started.
        </div>
      )}
    </div>
  )
}

export default TruckTable