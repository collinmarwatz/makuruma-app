import type { ExpenseOrder, ExpenseCategory, LineCategory, Currency } from '../types/expense'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface ExpenseLineInput {
  line_category: LineCategory
  vendor_id?: string
  booking_truck_id?: string
  group_key?: string
  description: string
  currency: Currency
  exchange_rate: string
  original_amount: string
}

export interface CreateExpenseData {
  category: ExpenseCategory
  trip_id?: string
  truck_id?: string
  payment_account?: string
  initiated_by?: string
  payment_date?: string
  lines: ExpenseLineInput[]
}

export async function fetchExpenseOrders(filters?: { date_from?: string; date_to?: string }): Promise<ExpenseOrder[]> {
  const params = new URLSearchParams()
  if (filters?.date_from) params.set('date_from', filters.date_from)
  if (filters?.date_to) params.set('date_to', filters.date_to)
  const query = params.toString()
  return apiClient(`/expense-orders${query ? `?${query}` : ''}`)
}

export async function createExpenseOrder(data: CreateExpenseData): Promise<ExpenseOrder> {
  return apiClient('/expense-orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateExpenseOrder(
  id: number,
  data: { payment_account?: string; initiated_by?: string; payment_date?: string; lines: ExpenseLineInput[] }
): Promise<ExpenseOrder> {
  return apiClient(`/expense-orders/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function approveExpenseOrder(id: number): Promise<ExpenseOrder> {
  return apiClient(`/expense-orders/${id}/approve`, { method: 'POST' })
}

export async function rejectExpenseOrder(id: number): Promise<ExpenseOrder> {
  return apiClient(`/expense-orders/${id}/reject`, { method: 'POST' })
}

export async function markExpensePaid(id: number): Promise<ExpenseOrder> {
  return apiClient(`/expense-orders/${id}/mark-paid`, { method: 'POST' })
}

export async function deleteExpenseOrder(id: number): Promise<void> {
  return apiClient(`/expense-orders/${id}`, { method: 'DELETE' })
}

export async function downloadExpenseOrder(expense: ExpenseOrder): Promise<void> {
  const token = localStorage.getItem('auth_token')

  const response = await fetch(`${API_BASE_URL}/expense-orders/${expense.id}/download`, {
    headers: {
      Accept: 'application/pdf',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!response.ok) throw new Error('Failed to download expense order')

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `expense-${expense.order_number}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}