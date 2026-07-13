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

function TruckCard({ truck }: TruckCardProps) {
  const documentsExpiringSoon = truck.documents.filter(
    (doc) => getExpiryStatus(doc) === 'expiring-soon' || getExpiryStatus(doc) === 'expired'
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-lg font-bold text-gray-800">{truck.reg_no}</h2>
        <Badge label={truck.status} color={statusColors[truck.status]} />
      </div>

      <p className="text-sm text-gray-500 mb-1">Capacity: {truck.capacity} tons</p>
      <p className="text-sm text-gray-500 mb-1">Trailer: {truck.trailer?.reg_no ?? 'Not assigned'}</p>
      <p className="text-sm text-gray-500 mb-3">Driver: {truck.driver?.full_name ?? 'Not assigned'}</p>

      {documentsExpiringSoon.length > 0 && (
        <div className="border-t border-gray-100 pt-3 space-y-1.5">
          {documentsExpiringSoon.map((doc) => {
            const status = getExpiryStatus(doc)
            return (
              <div key={doc.id} className="flex items-center justify-between text-xs">
                <span className="text-gray-500">{doc.document_type}</span>
                <Badge label={status} color={status === 'expired' ? 'red' : 'yellow'} />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default TruckCard