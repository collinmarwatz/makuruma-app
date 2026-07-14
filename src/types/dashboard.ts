export interface DashboardSummary {
  fleet: {
    total: number
    active: number
    maintenance: number
    decommissioned: number
  }
  compliance: {
    expired: number
    expiring_soon: number
    upcoming: {
      id: number
      documentable_type: string
      documentable_id: number
      document_type: string
      expiry_date: string
    }[]
  }
  bookings: {
    total: number
    awaiting_return: number
    completed: number
    this_month: number
  }
  tracking: {
    loading: number
    in_transit: number
    at_border: number
    offloading: number
    delayed: number
    completed: number
  }
  expenses: {
    pending_count: number
    pending_total: number
    paid_this_month: number
    by_category: { trip: number; office: number; truck: number }
  }
  invoicing: {
    total_invoiced: number
    this_month: number
    monthly_trend: { month: string; total: string }[]
  }
}