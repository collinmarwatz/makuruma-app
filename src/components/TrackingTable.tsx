import type { TrackedTruck } from '../types/tracking'
import Badge from './ui/Badge'
import { TRACKING_STATUS_COLORS, TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'
import { Eye, Download } from 'lucide-react'

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
            <th className="px-4 py-3">Loading Point</th>
            <th className="px-4 py-3">Offloading Point</th>
            <th className="px-4 py-3">Current Location</th>
            <th className="px-4 py-3">Current Status</th>
            <th className="px-4 py-3">Arriving Loading Point</th>
            <th className="px-4 py-3">Arriving Offloading Point</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {trucks.map((bt) => {
            const statusLabel = TRACKING_STATUS_OPTIONS.find((o) => o.value === bt.current_status)?.label ?? bt.current_status
            return (
              <tr key={bt.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{bt.truck.reg_no}</td>
                <td className="px-4 py-3 text-gray-600">{bt.trailer?.reg_no ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{bt.driver?.full_name ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{bt.loading_point ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{bt.offloading_point ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{bt.current_location ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={statusLabel} color={TRACKING_STATUS_COLORS[bt.current_status]} />
                </td>
                <td className="px-4 py-3 text-gray-600">{bt.loading_point_arrival_date ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{bt.offloading_date ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <button
                      onClick={() => onView(bt)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View / update tracking"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3">
    <div className="flex justify-end gap-2">
      <button
        onClick={() => onDownload(bt)}
        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Download tracking report"
      >
        <Download size={16} />
      </button>
      <button
        onClick={() => onView(bt)}
        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
        title="View / update tracking"
      >
      </button>
    </div>
  </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {trucks.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No trucks currently in transit.</div>
      )}
    </div>
  )
}

export default TrackingTable