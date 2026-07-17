import type { OfficeAsset, OfficeAssetCategory, OfficeAssetCondition } from  '../types/OfficeAsset'
import { apiClient } from './apiClient'

export interface OfficeAssetFormData {
  name: string
  category: OfficeAssetCategory
  serial_number: string
  buying_price: string
  purchase_date: string
  location: string
  condition: OfficeAssetCondition
  notes: string
}

export async function fetchOfficeAssets(): Promise<OfficeAsset[]> {
  return apiClient('/office-assets')
}

export async function createOfficeAsset(data: OfficeAssetFormData): Promise<OfficeAsset> {
  return apiClient('/office-assets', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateOfficeAsset(id: number, data: Partial<OfficeAssetFormData>): Promise<OfficeAsset> {
  return apiClient(`/office-assets/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteOfficeAsset(id: number): Promise<void> {
  return apiClient(`/office-assets/${id}`, { method: 'DELETE' })
}