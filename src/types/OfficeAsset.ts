export type OfficeAssetCategory = 'furniture' | 'electronics' | 'equipment' | 'vehicle' | 'other'
export type OfficeAssetCondition = 'active' | 'under_repair' | 'disposed'

export interface OfficeAsset {
  id: number
  name: string
  category: OfficeAssetCategory
  serial_number: string | null
  buying_price: string | null
  purchase_date: string | null
  location: string | null
  condition: OfficeAssetCondition
  notes: string | null
}