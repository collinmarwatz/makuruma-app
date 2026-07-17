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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
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
        <tbody className="divide-y divide-gray-100">
          {trucks.map((truck) => {
            const statusLabel = TRACKING_STATUS_OPTIONS.find((o) => o.value === truck.current_status)?.label ?? truck.current_status
            const recentBooking = truck.booking_trucks?.[0] ?? null

            return (
              <tr key={truck.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{truck.reg_no}</td>
                <td className="px-4 py-3 text-gray-600">{truck.trailer?.reg_no ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{truck.driver?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{truck.driver?.phone ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{truck.current_location ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Badge label={statusLabel} color={TRACKING_STATUS_COLORS[truck.current_status]} />
                    {recentBooking?.is_overdue && (
                      <span title="Past ETA, not yet completed">
                        <AlertTriangle size={14} className="text-red-500" />
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.booking.loading_point ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.loading_point_arrival_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.loading_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.booking.offloading_point ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.loading_dispatch_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.offloading_point_arrival_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{recentBooking?.offloading_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onDownload(truck)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download tracking report">
                      <Download size={16} />
                    </button>
                    <button onClick={() => onView(truck)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View / update tracking">
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
        <div className="text-center py-12 text-gray-400 text-sm">No trucks in your fleet yet.</div>
      )}
    </div>
  )
}

export default TrackingTable