import { apiClient } from './apiClient'

export interface CreateVendorPaymentData {
  vendor_id: string
  amount: string
  payment_date: string
  description?: string
}

export async function createVendorPayment(data: CreateVendorPaymentData) {
  return apiClient('/vendor-payments', { method: 'POST', body: JSON.stringify(data) })
}

export async function deleteVendorPayment(id: number): Promise<void> {
  return apiClient(`/vendor-payments/${id}`, { method: 'DELETE' })
}