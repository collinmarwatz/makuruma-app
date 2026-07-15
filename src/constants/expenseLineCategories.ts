import type { LineCategory } from '../types/expense'

export const LINE_CATEGORIES: { value: LineCategory; label: string; needsVendor: boolean }[] = [
  { value: 'fuel', label: 'Fuel', needsVendor: true },
  { value: 'vibali_tunduma', label: 'Vibali Tunduma', needsVendor: false },
  { value: 'vibali_congo', label: 'Vibali Congo', needsVendor: false },
  { value: 'mengine', label: 'Mengine (Other)', needsVendor: false },
]

export const CURRENCIES: { value: 'TZS' | 'USD' | 'ZMK'; label: string }[] = [
  { value: 'TZS', label: 'TZS' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'ZMK', label: 'ZMK' },
]