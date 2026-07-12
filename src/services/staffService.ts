import type { Staff } from '../types/employee'
import { apiClient } from './apiClient'

export interface StaffFormData {
  full_name: string
  phone: string
  tin_number: string
  payment_account: string
}

export async function fetchStaff(): Promise<Staff[]> {
  return apiClient('/staff')
}

export async function createStaff(data: StaffFormData): Promise<Staff> {
  return apiClient('/staff', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateStaff(id: number, data: Partial<StaffFormData>): Promise<Staff> {
  return apiClient(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteStaff(id: number): Promise<void> {
  return apiClient(`/staff/${id}`, { method: 'DELETE' })
}