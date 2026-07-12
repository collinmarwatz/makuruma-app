import type { Document } from './truck'

export interface Trailer {
  id: number
  reg_no: string
  documents: Document[]
}   