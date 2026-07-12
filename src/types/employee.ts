import type { Document } from './truck'

export interface Staff {
  id: number
  full_name: string
  phone: string | null
  tin_number: string | null
  payment_account: string | null
  documents: Document[]
}

export interface Driver {
  id: number
  full_name: string
  phone: string | null
  documents: Document[]
}