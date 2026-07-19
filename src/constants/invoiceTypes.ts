import type { InvoiceType } from '../types/invoice'

export const INVOICE_TYPES: { value: InvoiceType; label: string; quantityLabel: string; rateLabel: string }[] = [
  { value: 'advance', label: 'Advance', quantityLabel: 'Capacity (Ton)', rateLabel: 'Transit Rate ($)' },
  { value: 'settlement', label: 'Settlement', quantityLabel: 'Offloading Weight (Ton)', rateLabel: 'Transit Rate ($)' },
  { value: 'standing_time', label: 'Standing Time', quantityLabel: 'Days', rateLabel: 'Detention Rate ($)' },
  { value: 'adjustment', label: 'Adjustment', quantityLabel: 'Offloading Weight (Ton)', rateLabel: 'Adjusted Rate ($)' },
]