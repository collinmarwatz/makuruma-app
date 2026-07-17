import type { Trip } from '../types/trip'
import { apiClient } from './apiClient'

export interface TruckAssignment {
  truck_id: string
  trailer_id?: string
  driver_id?: string
  capacity_override?: string
  cargo?: string
  loading_point?: string
  loading_point_arrival_date?: string
  offloading_point?: string
  offloading_date?: string
  invoiced_transit_weight?: string
  invoiced_detention_charge?: string
  exchange_rate?: string
}

export interface LegPayload {
  trucks: TruckAssignment[]
  client_id?: string
  rate?: string
  eta?: string
  location?: string
  item_sn?: string
  description?: string
  quantity?: string
  amount?: string
}

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export async function fetchTrips(): Promise<Trip[]> {
  return apiClient('/trips')
}

export async function createBooking(data: LegPayload): Promise<Trip> {
  return apiClient('/trips', { method: 'POST', body: JSON.stringify(data) })
}

export async function findTripByNumber(tripNumber: string): Promise<Trip> {
  return apiClient('/trips/find-by-number', {
    method: 'POST',
    body: JSON.stringify({ trip_number: tripNumber }),
  })
}

export async function addTripLeg(tripId: number, direction: 'go' | 'return', data: LegPayload) {
  return apiClient(`/trips/${tripId}/legs`, {
    method: 'POST',
    body: JSON.stringify({ direction, ...data }),
  })
}

export async function updateTripLeg(legId: number, data: LegPayload) {
  return apiClient(`/trip-legs/${legId}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteTrip(id: number): Promise<void> {
  return apiClient(`/trips/${id}`, { method: 'DELETE' })
}

export async function downloadBookingOrder(trip: Trip): Promise<void> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE_URL}/trips/${trip.id}/download`, {
    headers: {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) throw new Error('Failed to download booking order')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `booking-${trip.trip_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}