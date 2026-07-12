import { useState, type FormEvent } from 'react'
import { createStaff, updateStaff } from '../services/staffService'
import { createDocument } from '../services/documentService'
import { STAFF_DOCUMENT_TYPES } from '../constants/employeeCompliance'
import type { Staff } from '../types/employee'
import { Loader2 } from 'lucide-react'

interface StaffFormProps {
  staff?: Staff | null
  onSaved: () => void
}

function StaffForm({ staff, onSaved }: StaffFormProps) {
  const isEditMode = !!staff

  const [fullName, setFullName] = useState(staff?.full_name ?? '')
  const [phone, setPhone] = useState(staff?.phone ?? '')
  const [tinNumber, setTinNumber] = useState(staff?.tin_number ?? '')
  const [paymentAccount, setPaymentAccount] = useState(staff?.payment_account ?? '')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = { full_name: fullName, phone, tin_number: tinNumber, payment_account: paymentAccount }
      const savedStaff = isEditMode
        ? await updateStaff(staff.id, payload)
        : await createStaff(payload)

      if (attachment) {
        await createDocument('staff', savedStaff.id, {
          document_type: STAFF_DOCUMENT_TYPES[0].key,
          expiry_date: '',
          attachment,
        })
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save staff member')
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">TIN Number</label>
          <input type="text" value={tinNumber} onChange={(e) => setTinNumber(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Account</label>
          <input type="text" value={paymentAccount} onChange={(e) => setPaymentAccount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Other Attachment</label>
        <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] ?? null)} className="w-full text-sm" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Staff' : 'Save Staff'}
      </button>
    </form>
  )
}

export default StaffForm