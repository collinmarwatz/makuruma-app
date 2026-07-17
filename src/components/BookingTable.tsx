import type { Booking } from '../types/booking'
import Badge from './ui/Badge'
import { Pencil, Trash2, Download } from 'lucide-react'

interface BookingTableProps {
  bookings: Booking[]
  onEdit: (booking: Booking) => void
  onDelete: (booking: Booking) => void
  onDownload: (booking: Booking) => void
}

function licenseOf(driver: { documents?: { document_type: string; number: string | null }[] } | null): string {
  return driver?.documents?.find((d) => d.document_type === 'license')?.number ?? '—'
}
function passportOf(driver: { documents?: { document_type: string; number: string | null }[] } | null): string {
  return driver?.documents?.find((d) => d.document_type === 'passport')?.number ?? '—'
}

function BookingTable({ bookings, onEdit, onDelete, onDownload }: BookingTableProps) {
  // One row per truck across all bookings, matching your simplified table format
  const rows = bookings.flatMap((booking) =>
    booking.booking_trucks.map((bt) => ({ booking, bt }))
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Booking No.</th>
            <th className="px-4 py-3">Transporter</th>
            <th className="px-4 py-3">Truck</th>
            <th className="px-4 py-3">Trailer</th>
            <th className="px-4 py-3">Ton</th>
            <th className="px-4 py-3">Drivers Name</th>
            <th className="px-4 py-3">Driving Licence</th>
            <th className="px-4 py-3">Passport</th>
            <th className="px-4 py-3">ETA</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Driver Contact</th>
            <th className="px-4 py-3">Trip Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map(({ booking, bt }) => (
            <tr key={bt.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{booking.booking_number}</td>
              <td className="px-4 py-3 text-gray-600">Makuruma Logistics</td>
              <td className="px-4 py-3 text-gray-600">{bt.truck.reg_no}</td>
              <td className="px-4 py-3 text-gray-600">{bt.trailer?.reg_no ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{bt.capacity ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{bt.driver?.full_name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{licenseOf(bt.driver)}</td>
              <td className="px-4 py-3 text-gray-600">{passportOf(bt.driver)}</td>
              <td className="px-4 py-3 text-gray-600">{booking.eta ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{bt.truck.current_location ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{bt.driver?.phone ?? '—'}</td>
              <td className="px-4 py-3">
  <Badge
    label={booking.direction === 'go' ? 'Go' : 'Return'}
    color={booking.direction === 'go' ? 'yellow' : 'green'}
  />
</td>
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
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No bookings yet. Click "New Booking" to get started.</div>
      )}
    </div>
  )
}

export default BookingTable