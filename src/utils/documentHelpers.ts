import type { Document } from '../types/truck'

export function getExpiryStatus(doc: Document): 'expired' | 'expiring-soon' | 'valid' | 'unknown' {
  if (!doc.expiry_date) return 'unknown'

  const expiry = new Date(doc.expiry_date)
  const today = new Date()
  const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring-soon'
  return 'valid'
}