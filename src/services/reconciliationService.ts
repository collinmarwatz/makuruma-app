import type { ClientReconciliationSummary, VendorReconciliationSummary } from '../types/reconciliation'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export async function fetchClientSummary(clientId: number): Promise<ClientReconciliationSummary> {
  return apiClient(`/reconciliation/clients/${clientId}/summary`)
}

export async function fetchVendorSummary(vendorId: number): Promise<VendorReconciliationSummary> {
  return apiClient(`/reconciliation/vendors/${vendorId}/summary`)
}

async function downloadFile(url: string, filename: string): Promise<void> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) throw new Error('Download failed')

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}

export async function downloadClientStatement(clientId: number, clientName: string): Promise<void> {
  return downloadFile(`${API_BASE_URL}/reconciliation/clients/${clientId}/statement`, `statement-${clientName}.xlsx`)
}

export async function downloadVendorLedger(vendorId: number, vendorName: string): Promise<void> {
  return downloadFile(`${API_BASE_URL}/reconciliation/vendors/${vendorId}/ledger`, `vendor-ledger-${vendorName}.xlsx`)
}