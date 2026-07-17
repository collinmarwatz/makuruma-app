import type { Trip } from '../types/trip'
import Badge from './ui/Badge'

interface TripsTableProps {
  trips: Trip[]
}

function TripsTable({ trips }: TripsTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Trip Code</th>
            <th className="px-4 py-3">Truck</th>
            <th className="px-4 py-3">Go Booking</th>
            <th className="px-4 py-3">Go Client</th>
            <th className="px-4 py-3">Return Booking</th>
            <th className="px-4 py-3">Return Client</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trips.map((trip) => {
            const isComplete = !!trip.return_booking_truck

            return (
              <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{trip.trip_code}</td>
                <td className="px-4 py-3 text-gray-600">{trip.truck.reg_no}</td>
                <td className="px-4 py-3 text-gray-600">{trip.go_booking_truck?.booking.booking_number ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{trip.go_booking_truck?.booking.client.company_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{trip.return_booking_truck?.booking.booking_number ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{trip.return_booking_truck?.booking.client.company_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={isComplete ? 'Completed' : 'Awaiting Return'} color={isComplete ? 'green' : 'yellow'} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {trips.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No trips yet.</div>
      )}
    </div>
  )
}

export default TripsTable