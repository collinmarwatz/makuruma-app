import type { ExpenseOrder, ExpenseCategory } from '../types/expense'
import { apiClient } from './apiClient'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export interface ExpenseLineInput {
  description: string
  amount: string
}

export interface CreateExpenseData {
  category: ExpenseCategory
  trip_id?: string
  truck_id?: string
  trucks?: string[]
  lines: ExpenseLineInput[]
}

export async function fetchExpenseOrders(): Promise<ExpenseOrder[]> {
  return apiClient('/expense-orders')
}

export async function createExpenseOrder(data: CreateExpenseData): Promise<ExpenseOrder> {
  return apiClient('/expense-orders', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateExpenseOrder(id: number, lines: ExpenseLineInput[]): Promise<ExpenseOrder> {
  return apiClient(`/expense-orders/${id}`, { method: 'PUT', body: JSON.stringify({ lines }) })
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