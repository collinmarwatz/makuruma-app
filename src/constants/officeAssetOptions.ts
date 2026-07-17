import type { OfficeAssetCategory, OfficeAssetCondition } from '../types/OfficeAsset'

export const OFFICE_ASSET_CATEGORIES: { value: OfficeAssetCategory; label: string }[] = [
  { value: 'furniture', label: 'Furniture' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'equipment', label: 'Equipment' },
  { value: 'vehicle', label: 'Vehicle (non-truck)' },
  { value: 'other', label: 'Other' },
]

export const OFFICE_ASSET_CONDITIONS: { value: OfficeAssetCondition; label: string; color: 'green' | 'yellow' | 'red' | 'gray' }[] = [
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'under_repair', label: 'Under Repair', color: 'yellow' },
  { value: 'disposed', label: 'Disposed', color: 'red' },
]