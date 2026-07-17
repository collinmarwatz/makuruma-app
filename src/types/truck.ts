export interface Document {
  id: number
  document_type: string
  number: string | null
  issue_date: string | null
  expiry_date: string | null
  attachment_path: string | null
}

export interface Truck {
  id: number
  reg_no: string
  capacity: string
  buying_price: string | null
  status: "active" | "maintenance" | "decommissioned"
  trip_status: "go" | "return" | "off_duty"
  current_location: string | null
  current_status: string
  trailer_id: number | null
  driver_id: number | null
  trailer: { id: number; reg_no: string } | null
  driver: { id: number; full_name: string } | null
  created_at: string
  updated_at: string
  documents: Document[]
}