import type { Truck } from '../types/truck'
import { apiClient } from './apiClient'

export async function fetchTrucks(): Promise<Truck[]> {
  return apiClient('/trucks')
}

export async function createTruck(data: { reg_no: string; capacity: string }): Promise<Truck> {
  return apiClient('/trucks', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateTruck(id: number, data: { reg_no?: string; capacity?: string; status?: string }): Promise<Truck> {
  return apiClient(`/trucks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteTruck(id: number): Promise<void> {
  return apiClient(`/trucks/${id}`, {
    method: 'DELETE',
  })
}