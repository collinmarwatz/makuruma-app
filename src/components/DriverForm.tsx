import { useState, type FormEvent } from 'react'
import { createDriver, updateDriver } from '../services/driverService'
import { createDocument } from '../services/documentService'
import { DRIVER_DOCUMENT_TYPES } from '../constants/employeeCompliance'
import type { Driver } from '../types/employee'
import { Loader2 } from 'lucide-react'

interface DriverFormProps {
  driver?: Driver | null
  onSaved: () => void
}

interface DocFieldState {
  number: string
  expiryDate: string
  attachment: File | null
}

type DocState = Record<string, DocFieldState>

function initialDocState(driver?: Driver | null): DocState {
  const state: DocState = {}
  DRIVER_DOCUMENT_TYPES.forEach(({ key }) => {
    const existing = driver?.documents?.find((d) => d.document_type === key)
    state[key] = {
      number: existing?.number ?? '',
      expiryDate: existing?.expiry_date?.slice(0, 10) ?? '',
      attachment: null,
    }
  })
  return state
}

function DriverForm({ driver, onSaved }: DriverFormProps) {
  const isEditMode = !!driver

  const [fullName, setFullName] = useState(driver?.full_name ?? '')
  const [phone, setPhone] = useState(driver?.phone ?? '')
  const [docs, setDocs] = useState<DocState>(() => initialDocState(driver))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDoc(key: string, field: keyof DocFieldState, value: string | File | null) {
    setDocs((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const savedDriver = isEditMode
        ? await updateDriver(driver.id, { full_name: fullName, phone })
        : await createDriver({ full_name: fullName, phone })

      for (const { key } of DRIVER_DOCUMENT_TYPES) {
        const { number, expiryDate, attachment } = docs[key]
        if (!expiryDate && !number && !attachment) continue

        await createDocument('drivers', savedDriver.id, {
          document_type: key,
          number: number || undefined,
          expiry_date: expiryDate,
          attachment,
        })
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save driver')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name (as on passport)</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <h3 className="text-sm font-bold text-gray-600 mb-3">Documents</h3>
      <div className="space-y-3 mb-6">
        {DRIVER_DOCUMENT_TYPES.map(({ key, label }) => (
          <div key={key} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Number</label>
                <input type="text" value={docs[key].number} onChange={(e) => updateDoc(key, 'number', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Due Date</label>
                <input type="date" value={docs[key].expiryDate} onChange={(e) => updateDoc(key, 'expiryDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Attachment {docs[key].attachment === null && isEditMode && '(leave blank to keep existing)'}
                </label>
                <input type="file" onChange={(e) => updateDoc(key, 'attachment', e.target.files?.[0] ?? null)} className="w-full text-xs" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Driver' : 'Save Driver'}
      </button>
    </form>
  )
}

export default DriverForm