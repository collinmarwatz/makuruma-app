import type { Vendor } from '../types/partner'
import { apiClient } from './apiClient'

export interface VendorFormData {
  company_name: string
  vendor_type: 'fuel' | 'e-seal'
  phone: string
}

export async function fetchVendors(): Promise<Vendor[]> {
  return apiClient('/vendors')
}

export async function createVendor(data: VendorFormData): Promise<Vendor> {
  return apiClient('/vendors', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateVendor(id: number, data: Partial<VendorFormData>): Promise<Vendor> {
  return apiClient(`/vendors/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteVendor(id: number): Promise<void> {
  return apiClient(`/vendors/${id}`, { method: 'DELETE' })
}