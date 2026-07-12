import type { Driver } from '../types/employee'
import { apiClient } from './apiClient'

export interface DriverFormData {
  full_name: string
  phone: string
}

export async function fetchDrivers(): Promise<Driver[]> {
  return apiClient('/drivers')
}

export async function createDriver(data: DriverFormData): Promise<Driver> {
  return apiClient('/drivers', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateDriver(id: number, data: Partial<DriverFormData>): Promise<Driver> {
  return apiClient(`/drivers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteDriver(id: number): Promise<void> {
  return apiClient(`/drivers/${id}`, { method: 'DELETE' })
}