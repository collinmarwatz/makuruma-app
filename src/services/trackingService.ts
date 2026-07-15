import type { TrackedTruck, Checkpoint, TrackingStatus } from '../types/tracking'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export async function fetchCheckpoints(): Promise<Checkpoint[]> {
  return apiClient('/checkpoints')
}

export async function fetchTrackedTrucks(): Promise<TrackedTruck[]> {
  return apiClient('/tracking')
}

export async function updateTrackingStatus(
  truckId: number,
  data: { current_location?: string; current_status: TrackingStatus }
): Promise<TrackedTruck> {
  return apiClient(`/tracking/${truckId}/status`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function upsertMilestone(
  truckId: number,
  data: { checkpoint_id: number; arrival_at?: string; dispatch_at?: string }
) {
  return apiClient(`/tracking/${truckId}/milestones`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTripDates(
  bookingTruckId: number,
  data: { actual_loading_date?: string; actual_offloading_date?: string }
) {
  return apiClient(`/booking-trucks/${bookingTruckId}/dates`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function uploadProofOfDelivery(bookingTruckId: number, file: File) {
  const token = localStorage.getItem('auth_token')
  const formData = new FormData()
  formData.append('document_type', 'POD')
  formData.append('attachment', file)

  const response = await fetch(`${API_BASE_URL}/booking-trucks/${bookingTruckId}/documents`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) throw new Error('Failed to upload proof of delivery')
  return response.json()
}

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
  link.download = `tracking-${truck.reg_no}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}