import type { Invoice, InvoiceableLeg } from '../types/invoice'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface CreateInvoiceData {
  client_id: string
  invoice_date: string
  mode_of_payment?: string
  booking_truck_ids: string[]
}

export async function fetchInvoices(): Promise<Invoice[]> {
  return apiClient('/invoices')
}

export async function fetchInvoiceableLegs(clientId: string): Promise<InvoiceableLeg[]> {
  return apiClient(`/invoices/invoiceable-legs?client_id=${clientId}`)
}

export async function createInvoice(data: CreateInvoiceData): Promise<Invoice> {
  return apiClient('/invoices', { method: 'POST', body: JSON.stringify(data) })
}

export async function deleteInvoice(id: number): Promise<void> {
  return apiClient(`/invoices/${id}`, { method: 'DELETE' })
}

export async function downloadInvoice(invoice: Invoice): Promise<void> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE_URL}/invoices/${invoice.id}/download`, {
    headers: {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) throw new Error('Failed to download invoice')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `invoice-${invoice.invoice_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}