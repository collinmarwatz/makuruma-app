import type { TrackedTruck } from '../types/tracking'
import { TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'

function escapeCsvCell(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export function exportTrackingCsv(trucks: TrackedTruck[]) {
  const headers = [
    'Booking Number', 'Direction', 'Truck', 'Trailer', 'Driver',
    'Loading Point', 'Offloading Point', 'Current Location', 'Current Status',
    'Arrival Loading Point', 'Arrival Offloading Point',
  ]

  const rows = trucks.map((bt) => {
    const statusLabel = TRACKING_STATUS_OPTIONS.find((o) => o.value === bt.current_status)?.label ?? bt.current_status
    return [
      bt.trip_leg.trip.trip_number,
      bt.trip_leg.direction.toUpperCase(),
      bt.truck.reg_no,
      bt.trailer?.reg_no ?? '',
      bt.driver?.full_name ?? '',
      bt.loading_point ?? '',
      bt.offloading_point ?? '',
      bt.current_location ?? '',
      statusLabel,
      bt.loading_point_arrival_date ?? '',
      bt.offloading_date ?? '',
    ].map((cell) => escapeCsvCell(String(cell)))
  })

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tracking-export-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}