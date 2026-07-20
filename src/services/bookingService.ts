import type { Booking, EligibleTruck } from '../types/booking'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface CreateBookingData {
  direction: 'go' | 'return'
  client_id: string
  eta?: string
  location?: string
  loading_point?: string
  offloading_point?: string
  description?: string
  truck_ids: string[]
}

export interface TruckDetailInput {
  booking_truck_id: string
  cargo?: string
  rate?: string
}

export interface UpdateBookingData {
  eta?: string
  location?: string
  loading_point?: string
  offloading_point?: string
  description?: string
  trucks: TruckDetailInput[]
}

export async function fetchBookings(): Promise<Booking[]> {
  return apiClient('/bookings')
}

export async function fetchEligibleTrucks(direction: 'go' | 'return'): Promise<EligibleTruck[]> {
  return apiClient(`/bookings/eligible-trucks?direction=${direction}`)
}

export async function createBooking(data: CreateBookingData): Promise<Booking> {
  return apiClient('/bookings', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateBooking(id: number, data: UpdateBookingData): Promise<Booking> {
  return apiClient(`/bookings/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteBooking(id: number): Promise<void> {
  return apiClient(`/bookings/${id}`, { method: 'DELETE' })
}
export async function removeTruckFromBooking(bookingId: number, bookingTruckId: number): Promise<void> {
  return apiClient(`/bookings/${bookingId}/trucks/${bookingTruckId}`, { method: 'DELETE' })
}

export async function downloadBookingAccessList(booking: Booking): Promise<void> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE_URL}/bookings/${booking.id}/download`, {
    headers: {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) throw new Error('Failed to download access list')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `booking-${booking.booking_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}