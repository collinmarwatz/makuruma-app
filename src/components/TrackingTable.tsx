import type { TrackedTruck } from '../types/tracking'
import Badge from './ui/Badge'
import { TRACKING_STATUS_COLORS, TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'
import { Eye, Download, AlertTriangle } from 'lucide-react'

interface TrackingTableProps {
  trucks: TrackedTruck[]
  onView: (truck: TrackedTruck) => void
  onDownload: (truck: TrackedTruck) => void
}

function TrackingTable({ trucks, onView, onDownload }: TrackingTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Truck Number</th>
            <th className="px-4 py-3">Trailer</th>
            <th className="px-4 py-3">Driver Name</th>
            <th className="px-4 py-3">Driver Contact</th>
            <th className="px-4 py-3">Current Location</th>
            <th className="px-4 py-3">Current Status</th>
            <th className="px-4 py-3">Loading Point</th>
            <th className="px-4 py-3">Loading Arrival</th>
            <th className="px-4 py-3">Loading Date</th>
            <th className="px-4 py-3">Offloading Point</th>
            <th className="px-4 py-3">Dispatch</th>
            <th className="px-4 py-3">Offloading Arrival</th>
            <th className="px-4 py-3">Offloading Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {trucks.map((truck) => {
            const statusLabel = TRACKING_STATUS_OPTIONS.find((o) => o.value === truck.current_status)?.label ?? truck.current_status
            const recentBooking = truck.booking_trucks?.[0] ?? null

            return (
              <tr key={truck.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{truck.reg_no}</td>
                <td className="px-4 py-3 text-muted-foreground">{truck.trailer?.reg_no ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{truck.driver?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{truck.driver?.phone ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{truck.current_location ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Badge label={statusLabel} color={TRACKING_STATUS_COLORS[truck.current_status]} />
                    {recentBooking?.is_overdue && (
                      <span title="Past ETA, not yet completed">
                        <AlertTriangle size={14} className="text-destructive" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.booking.loading_point ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.loading_point_arrival_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.loading_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.booking.offloading_point ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.loading_dispatch_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.offloading_point_arrival_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{recentBooking?.offloading_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onDownload(truck)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Download tracking report">
                      <Download size={16} />
                    </button>
                    <button onClick={() => onView(truck)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="View / update tracking">
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {trucks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No trucks in your fleet yet.</div>
      )}
    </div>
  )
}

export default TrackingTable