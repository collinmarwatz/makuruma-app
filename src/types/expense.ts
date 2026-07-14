import type { Trip } from './trip'
import type { Truck } from './truck'

export type ExpenseCategory = 'trip' | 'office' | 'truck'
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid'

export interface ExpenseLine {
  id: number
  description: string
  amount: string
}

export interface ExpenseUser {
  id: number
  name: string
}

export interface ExpenseTruck {
  id: number
  reg_no: string
}

export interface ExpenseOrder {
  id: number
  order_number: string
  category: ExpenseCategory
  status: ExpenseStatus
  total_amount: string
  trip: Trip | null
  truck: Truck | null
  trucks: ExpenseTruck[]
  creator: ExpenseUser
  approver: ExpenseUser | null
  approved_at: string | null
  payer: ExpenseUser | null
  paid_at: string | null
  lines: ExpenseLine[]
  created_at: string
}