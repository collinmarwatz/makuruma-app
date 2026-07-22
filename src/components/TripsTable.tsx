import { useState } from 'react'
import type { Trip } from '../types/trip'
import Badge from './ui/Badge'
import { downloadTruckProfitReport } from '../services/truckProfitReportService'
import { Download } from 'lucide-react'

interface TripsTableProps {
  trips: Trip[]
}

function TripsTable({ trips }: TripsTableProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  async function handleDownloadReport(truckId: number, regNo: string) {
    const year = new Date().getFullYear()
    setDownloadingId(truckId)
    try {
      await downloadTruckProfitReport(truckId, regNo, year)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Trip Code</th>
            <th className="px-4 py-3">Truck</th>
            <th className="px-4 py-3">Go Booking</th>
            <th className="px-4 py-3">Go Client</th>
            <th className="px-4 py-3">Return Booking</th>
            <th className="px-4 py-3">Return Client</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {trips.map((trip) => {
            const isComplete = !!trip.return_booking_truck

            return (
              <tr key={trip.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{trip.trip_code}</td>
                <td className="px-4 py-3 text-muted-foreground">{trip.truck.reg_no}</td>
                <td className="px-4 py-3 text-muted-foreground">{trip.go_booking_truck?.booking.booking_number ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{trip.go_booking_truck?.booking.client.company_name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{trip.return_booking_truck?.booking.booking_number ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{trip.return_booking_truck?.booking.client.company_name ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={isComplete ? 'Completed' : 'Awaiting Return'} color={isComplete ? 'green' : 'yellow'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDownloadReport(trip.truck.id, trip.truck.reg_no)}
                      disabled={downloadingId === trip.truck.id}
                      className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Download profit report"
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {trips.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No trips yet.</div>
      )}
    </div>
  )
}

export default TripsTable