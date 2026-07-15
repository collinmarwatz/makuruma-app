import { useState, type FormEvent } from 'react'
import { createTrailer, updateTrailer } from '../services/trailerService'
import { createDocument } from '../services/documentService'
import { TRAILER_COMPLIANCE_TYPES } from '../constants/compliance'
import type { Trailer } from '../types/trailer'
import { Loader2 } from 'lucide-react'

interface ComplianceFieldState {
  dueDate: string
  attachment: File | null
}

type ComplianceState = Record<string, ComplianceFieldState>

function initialComplianceState(): ComplianceState {
  const state: ComplianceState = {}
  TRAILER_COMPLIANCE_TYPES.forEach(({ key }) => {
    state[key] = { dueDate: '', attachment: null }
  })
  return state
}

interface TrailerFormProps {
  trailer?: Trailer | null
  onSaved: () => void
}

function TrailerForm({ trailer, onSaved }: TrailerFormProps) {
  const isEditMode = !!trailer

  const [regNo, setRegNo] = useState(trailer?.reg_no ?? '')
  const [compliance, setCompliance] = useState<ComplianceState>(initialComplianceState())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateCompliance(key: string, field: keyof ComplianceFieldState, value: string | File | null) {
    setCompliance((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const savedTrailer = isEditMode
        ? await updateTrailer(trailer.id, { reg_no: regNo })
        : await createTrailer({ reg_no: regNo })

      for (const { key } of TRAILER_COMPLIANCE_TYPES) {
        const { dueDate, attachment } = compliance[key]
        if (!dueDate) continue

            await createDocument('trailers', savedTrailer.id, {
            document_type: key,
            expiry_date: dueDate,
            attachment,
            })
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save trailer')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Reg No</label>
        <input
          type="text"
          value={regNo}
          onChange={(e) => setRegNo(e.target.value)}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <h3 className="text-sm font-bold text-gray-600 mb-3">Compliance Documents</h3>
      <div className="space-y-3 mb-6">
        {TRAILER_COMPLIANCE_TYPES.map(({ key, label }) => (
          <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end bg-gray-50 rounded-lg p-3">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Due Date</label>
              <input
                type="date"
                value={compliance[key].dueDate}
                onChange={(e) => updateCompliance(key, 'dueDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Attachment (optional)</label>
              <input
                type="file"
                onChange={(e) => updateCompliance(key, 'attachment', e.target.files?.[0] ?? null)}
                className="w-full text-xs"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Trailer' : 'Save Trailer'}
      </button>
    </form>
  )
}

export default TrailerForm