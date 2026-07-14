import type { Client } from './partner'

export interface InvoiceableLeg {
  id: number
  truck: { reg_no: string }
  trip_leg: { direction: 'go' | 'return'; description: string | null; trip: { trip_number: string } }
  rate: string | null
  quantity: string | null
  amount: string | null
}

export interface InvoiceLine {
  id: number
  description: string
  quantity: string | null
  rate: string | null
  amount: string
  booking_truck: { truck: { reg_no: string }; trip_leg: { trip: { trip_number: string } } } | null
}

export interface Invoice {
  id: number
  invoice_number: string
  client: Client
  invoice_date: string
  mode_of_payment: string | null
  total_amount: string
  creator: { id: number; name: string }
  lines: InvoiceLine[]
  created_at: string
}