import type { Booking, BookingTruck } from './booking'

export type InvoiceType = 'advance' | 'settlement' | 'standing_time' | 'adjustment'

export interface InvoiceLine {
  id: number
  booking_truck: BookingTruck
  description: string
  quantity: string
  rate: string
  days: number | null
  amount: string
}

export interface Invoice {
  id: number
  invoice_number: string
  deal_no: string | null
  bivac_no: string | null
  invoice_type: InvoiceType
  booking: Booking
  invoice_date: string
  mode_of_payment: string | null
  delivery_note_no: string | null
  delivery_note_date: string | null
  supplier_ref: string | null
  other_ref: string | null
  loading_con_no: string | null
  settlement_no: string | null
  dispatched_through: string | null
  destination: string | null
  terms_of_delivery: string | null
  total_amount: string
  creator: { id: number; name: string }
  lines: InvoiceLine[]
  created_at: string
}

export interface EligibleInvoiceTruck {
  id: number
  capacity: string | null
  rate: string | null
  truck: { id: number; reg_no: string }
  trailer: { id: number; reg_no: string } | null
  trip: { id: number; trip_code: string } | null
}