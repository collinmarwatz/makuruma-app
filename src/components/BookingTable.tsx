import type { Booking } from '../types/booking'
import Badge from './ui/Badge'
import { Pencil, Trash2, Download } from 'lucide-react'

interface BookingTableProps {
  bookings: Booking[]
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  onDownload: (booking: Booking) => void
}

function BookingTable({ bookings, onEdit, onDelete, onDownload }: BookingTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Booking No.</th>
            <th className="px-4 py-3">Direction</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Trucks</th>
            <th className="px-4 py-3">ETA</th>
            <th className="px-4 py-3">Loading Point</th>
            <th className="px-4 py-3">Offloading Point</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {bookings.map((booking) => {
            const truckRegNos = booking.booking_trucks.map((bt) => bt.truck.reg_no).join(', ')

            return (
              <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{booking.booking_number}</td>
                <td className="px-4 py-3">
                  <Badge label={booking.direction === 'go' ? 'Go' : 'Return'} color={booking.direction === 'go' ? 'yellow' : 'green'} />
                </td>
                <td className="px-4 py-3 text-gray-600">{booking.client.company_name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={truckRegNos}>
                  {truckRegNos} <span className="text-gray-400">({booking.booking_trucks.length})</span>
                </td>
                <td className="px-4 py-3 text-gray-600">{booking.eta ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{booking.loading_point ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{booking.offloading_point ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onDownload(booking)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download access list">
                      <Download size={16} />
                    </button>
                    <button onClick={() => onEdit(booking)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit booking">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(booking)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete booking">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {bookings.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No bookings yet. Click "New Booking" to get started.</div>
      )}
    </div>
  )
}

export default BookingTable