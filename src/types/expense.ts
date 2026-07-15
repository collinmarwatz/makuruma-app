import type { Trip } from './trip'
import type { Truck } from './truck'

export type ExpenseCategory = 'trip' | 'office' | 'truck'
export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'paid'
export type LineCategory = 'fuel' | 'vibali_tunduma' | 'vibali_congo' | 'mengine'
export type Currency = 'TZS' | 'USD' | 'ZMK'

export interface ExpenseLine {
  id: number
  line_category: LineCategory
  vendor: { id: number; company_name: string } | null
  booking_truck: { id: number; truck: { reg_no: string } } | null
  description: string
  currency: Currency
  exchange_rate: string
  original_amount: string
  amount: string
}

export interface ExpenseUser {
  id: number
  name: string
}

export interface ExpenseOrder {
  id: number
  order_number: string
  category: ExpenseCategory
  status: ExpenseStatus
  total_amount: string
  payment_account: string | null
  initiated_by: string | null
  payment_date: string | null
  trip: Trip | null
  truck: Truck | null
  creator: ExpenseUser
  approver: ExpenseUser | null
  approved_at: string | null
  payer: ExpenseUser | null
  paid_at: string | null
  lines: ExpenseLine[]
  created_at: string
}