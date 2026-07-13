import type { Trip } from '../types/trip'
import Badge from './ui/Badge'
import { Pencil, Trash2, Download } from 'lucide-react'

interface BookingTableProps {
  trips: Trip[]
  onEdit: (trip: Trip) => void
  onDelete: (trip: Trip) => void
  onDownload: (trip: Trip) => void
}

function BookingTable({ trips, onEdit, onDelete, onDownload }: BookingTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Booking Number</th>
            <th className="px-4 py-3">Trucks</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trips.map((trip) => {
            const goLeg = trip.legs.find((leg) => leg.direction === 'go')
            const hasReturn = trip.legs.some((leg) => leg.direction === 'return')
            const truckCount = goLeg?.booking_trucks.length ?? 0

            return (
              <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{trip.trip_number}</td>
                <td className="px-4 py-3 text-gray-600">
                  {truckCount === 1
                    ? goLeg?.booking_trucks[0].truck.reg_no
                    : truckCount > 1
                      ? `${truckCount} trucks`
                      : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">{goLeg?.client?.company_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={hasReturn ? 'Round Trip' : 'Go Only'} color={hasReturn ? 'green' : 'yellow'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onDownload(trip)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download booking order"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => onEdit(trip)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit booking"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(trip)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete booking"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {trips.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No bookings yet. Click "New Booking" to get started.</div>
      )}
    </div>
  )
}

export default BookingTable