import type { Trailer } from '../types/trailer'
import { apiClient } from './apiClient'

export async function fetchTrailers(): Promise<Trailer[]> {
  return apiClient('/trailers')
}

export async function createTrailer(data: { reg_no: string }): Promise<Trailer> {
  return apiClient('/trailers', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateTrailer(id: number, data: { reg_no?: string }): Promise<Trailer> {
  return apiClient(`/trailers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteTrailer(id: number): Promise<void> {
  return apiClient(`/trailers/${id}`, { method: 'DELETE' })
}