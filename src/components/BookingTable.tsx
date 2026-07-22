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
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
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
        <tbody className="divide-y divide-hairline">
          {bookings.map((booking) => {
            const truckRegNos = booking.booking_trucks.map((bt) => bt.truck.reg_no).join(', ')

            return (
              <tr key={booking.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{booking.booking_number}</td>
                <td className="px-4 py-3">
                  <Badge label={booking.direction === 'go' ? 'Go' : 'Return'} color={booking.direction === 'go' ? 'yellow' : 'green'} />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{booking.client.company_name}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={truckRegNos}>
                  {truckRegNos} <span className="text-muted-foreground/70">({booking.booking_trucks.length})</span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{booking.eta ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{booking.loading_point ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{booking.offloading_point ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onDownload(booking)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Download access list">
                      <Download size={16} />
                    </button>
                    <button onClick={() => onEdit(booking)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit booking">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(booking)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete booking">
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
        <div className="text-center py-12 text-muted-foreground text-sm">No bookings yet. Click "New Booking" to get started.</div>
      )}
    </div>
  )
}

export default BookingTable