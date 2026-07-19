export interface Client {
  id: number
  company_name: string
  short_code: string | null
  email: string | null
  phone: string | null
  allows_advance_invoice: boolean

}

export interface Vendor {
  id: number
  company_name: string
  vendor_type: 'fuel' | 'e-seal'
  phone: string | null
  location: string | null
}