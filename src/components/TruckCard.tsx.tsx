import type { Truck } from '../types/truck'
import Badge from './ui/Badge'
import { getExpiryStatus } from '../utils/documentHelpers'

interface TruckCardProps {
  truck: Truck
}

const statusColors: Record<Truck['status'], 'green' | 'yellow' | 'red' | 'gray'> = {
  active: 'green',
  maintenance: 'yellow',
  decommissioned: 'red',
}

const expiryColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  valid: 'green',
  'expiring-soon': 'yellow',
  expired: 'red',
  unknown: 'gray',
}

function TruckCard({ truck }: TruckCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-sm hover:shadow-xl transition">
      <h2 className="text-xl font-bold text-gray-800">{truck.reg_no}</h2>
      <p className="text-gray-500 mt-1">Capacity: {truck.capacity} tons</p>
      <div className="mt-2">
        <Badge label={truck.status} color={statusColors[truck.status]} />
      </div>

      {truck.documents.length > 0 && (
        <div className="mt-4 border-t pt-3 space-y-2">
          {truck.documents.map((doc) => {
            const status = getExpiryStatus(doc)
            return (
              <div key={doc.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{doc.document_type}</span>
                <Badge label={status} color={expiryColors[status]} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TruckCard