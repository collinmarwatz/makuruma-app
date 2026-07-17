import { useState, type FormEvent } from 'react'
import { createVendor, updateVendor } from '../services/vendorService'
import type { Vendor } from '../types/partner'
import { Loader2 } from 'lucide-react'

interface VendorFormProps {
  vendor?: Vendor | null
  onSaved: () => void
}

function VendorForm({ vendor, onSaved }: VendorFormProps) {
  const isEditMode = !!vendor

  const [companyName, setCompanyName] = useState(vendor?.company_name ?? '')
  const [vendorType, setVendorType] = useState<'fuel' | 'e-seal'>(vendor?.vendor_type ?? 'fuel')
  const [phone, setPhone] = useState(vendor?.phone ?? '')
  const [location, setLocation] = useState(vendor?.location ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = { company_name: companyName, vendor_type: vendorType, phone, location }
      if (isEditMode) {
        await updateVendor(vendor.id, payload)
      } else {
        await createVendor(payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vendor')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
        <input
          type="text"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type</label>
          <select
            value={vendorType}
            onChange={(e) => setVendorType(e.target.value as 'fuel' | 'e-seal')}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="fuel">Fuel</option>
            <option value="e-seal">E-seal</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Tunduma, Dar es Salaam"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Vendor' : 'Save Vendor'}
      </button>
    </form>
  )
}

export default VendorForm