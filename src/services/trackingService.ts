import type { TrackedTruck, Checkpoint, TrackingStatus } from '../types/tracking'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export async function downloadTrackingReport(truck: TrackedTruck): Promise<void> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE_URL}/tracking/${truck.id}/download`, {
    headers: {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) throw new Error('Failed to download tracking report')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `tracking-${truck.truck.reg_no}-${truck.trip_leg.trip.trip_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}

export async function fetchCheckpoints(): Promise<Checkpoint[]> {
  return apiClient('/checkpoints')
}

export async function fetchTrackedTrucks(): Promise<TrackedTruck[]> {
  return apiClient('/tracking')
}

export async function updateTrackingStatus(
  bookingTruckId: number,
  data: { current_location?: string; current_status: TrackingStatus }
): Promise<TrackedTruck> {
  return apiClient(`/tracking/${bookingTruckId}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function upsertMilestone(
  bookingTruckId: number,
  data: { checkpoint_id: number; arrival_at?: string; dispatch_at?: string }
) {
  return apiClient(`/tracking/${bookingTruckId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}