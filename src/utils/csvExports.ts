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
    'Booking Number', 'Truck', 'Trailer', 'Driver',
    'Loading Point', 'Offloading Point', 'Current Location', 'Current Status',
  ]

  const rows = trucks.map((truck) => {
    const statusLabel = TRACKING_STATUS_OPTIONS.find((o) => o.value === truck.current_status)?.label ?? truck.current_status
    const recentBooking = truck.booking_trucks?.[0]
    return [
      recentBooking?.trip_leg.trip.trip_number ?? '',
      truck.reg_no,
      truck.trailer?.reg_no ?? '',
      truck.driver?.full_name ?? '',
      recentBooking?.loading_point ?? '',
      recentBooking?.offloading_point ?? '',
      truck.current_location ?? '',
      statusLabel,
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