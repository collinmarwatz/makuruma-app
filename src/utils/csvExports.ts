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
    'Trip Code', 'Truck', 'Trailer', 'Driver', 'Driver Contact',
    'Current Location', 'Current Status',
    'Loading Point', 'Loading Arrival', 'Loading Date',
    'Offloading Point', 'Dispatch', 'Offloading Arrival', 'Offloading Date',
  ]

  const rows = trucks.map((truck) => {
    const statusLabel = TRACKING_STATUS_OPTIONS.find((o) => o.value === truck.current_status)?.label ?? truck.current_status
    const recentBooking = truck.booking_trucks?.[0]

    return [
      recentBooking?.trip?.trip_code ?? '',
      truck.reg_no,
      truck.trailer?.reg_no ?? '',
      truck.driver?.full_name ?? '',
      truck.driver?.phone ?? '',
      truck.current_location ?? '',
      statusLabel,
      recentBooking?.booking.loading_point ?? '',
      recentBooking?.loading_point_arrival_date?.slice(0, 10) ?? '',
      recentBooking?.loading_date?.slice(0, 10) ?? '',
      recentBooking?.booking.offloading_point ?? '',
      recentBooking?.loading_dispatch_date?.slice(0, 10) ?? '',
      recentBooking?.offloading_point_arrival_date?.slice(0, 10) ?? '',
      recentBooking?.offloading_date?.slice(0, 10) ?? '',
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