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
  status: "active" | "maintenance" | "decommissioned"
  trailer_id: number | null
  driver_id: number | null
  trailer: { id: number; reg_no: string } | null
  driver: { id: number; full_name: string } | null
  created_at: string
  updated_at: string
  documents: Document[]
}