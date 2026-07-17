import { useState, type FormEvent } from 'react'
import { createOfficeAsset, updateOfficeAsset } from '../services/officeAssetService'
import { OFFICE_ASSET_CATEGORIES, OFFICE_ASSET_CONDITIONS } from '../constants/officeAssetOptions'
import type { OfficeAsset, OfficeAssetCategory, OfficeAssetCondition } from '../types/OfficeAsset'
import { Loader2 } from 'lucide-react'

interface OfficeAssetFormProps {
  asset?: OfficeAsset | null
  onSaved: () => void
}

function OfficeAssetForm({ asset, onSaved }: OfficeAssetFormProps) {
  const isEditMode = !!asset

  const [name, setName] = useState(asset?.name ?? '')
  const [category, setCategory] = useState<OfficeAssetCategory>(asset?.category ?? 'other')
  const [serialNumber, setSerialNumber] = useState(asset?.serial_number ?? '')
  const [buyingPrice, setBuyingPrice] = useState(asset?.buying_price ?? '')
  const [purchaseDate, setPurchaseDate] = useState(asset?.purchase_date?.slice(0, 10) ?? '')
  const [location, setLocation] = useState(asset?.location ?? '')
  const [condition, setCondition] = useState<OfficeAssetCondition>(asset?.condition ?? 'active')
  const [notes, setNotes] = useState(asset?.notes ?? '')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    const payload = {
      name,
      category,
      serial_number: serialNumber,
      buying_price: buyingPrice,
      purchase_date: purchaseDate,
      location,
      condition,
      notes,
    }

    try {
      if (isEditMode) {
        await updateOfficeAsset(asset.id, payload)
      } else {
        await createOfficeAsset(payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save asset')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Asset Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as OfficeAssetCategory)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {OFFICE_ASSET_CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Serial / Tag Number</label>
          <input type="text" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Buying Price</label>
          <input type="number" step="0.01" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
          <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Head Office - Dar" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
        <select value={condition} onChange={(e) => setCondition(e.target.value as OfficeAssetCondition)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
          {OFFICE_ASSET_CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Asset' : 'Save Asset'}
      </button>
    </form>
  )
}

export default OfficeAssetForm