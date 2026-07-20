export interface ClientReconciliationSummary {
  client: string
  total_invoiced: number
  total_paid: number
  outstanding: number
  invoice_count: number
}

export interface VendorReconciliationSummary {
  vendor: string
  total_debt: number
  total_paid: number
  balance: number
}

export interface VendorPayment {
  id: number
  vendor_id: number
  amount: string
  payment_date: string
  description: string | null
  creator: { id: number; name: string }
  created_at: string
}