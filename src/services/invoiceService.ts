import type { Invoice, InvoiceType, EligibleInvoiceTruck } from '../types/invoice'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface InvoiceLineInput {
  booking_truck_id: string
  quantity: string
  rate: string
  days?: string
}

export interface CreateInvoiceData {
  invoice_type: InvoiceType
  booking_id: string
  invoice_date: string
  deal_no?: string
  bivac_no?: string
  mode_of_payment?: string
  delivery_note_no?: string
  delivery_note_date?: string
  supplier_ref?: string
  other_ref?: string
  loading_con_no?: string
  settlement_no?: string
  dispatched_through?: string
  destination?: string
  terms_of_delivery?: string
  lines: InvoiceLineInput[]
}

export async function fetchInvoices(): Promise<Invoice[]> {
  return apiClient('/invoices')
}

export async function fetchEligibleInvoiceTrucks(bookingId: string, invoiceType: InvoiceType): Promise<EligibleInvoiceTruck[]> {
  return apiClient(`/invoices/eligible-trucks?booking_id=${bookingId}&invoice_type=${invoiceType}`)
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