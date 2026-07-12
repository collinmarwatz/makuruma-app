import { useEffect, useState, type FormEvent } from 'react'
import { createTruck, updateTruck } from '../services/truckService'
import { createDocument } from '../services/documentService'
import { fetchTrailers } from '../services/trailerService'
import { fetchDrivers } from '../services/driverService'
import { TRUCK_COMPLIANCE_TYPES } from '../constants/compliance'
import type { Truck } from '../types/truck'
import type { Trailer } from '../types/trailer'
import type { Driver } from '../types/employee'
import { Loader2 } from 'lucide-react'

interface ComplianceFieldState {
  dueDate: string
  attachment: File | null
}

type ComplianceState = Record<string, ComplianceFieldState>

function initialComplianceState(): ComplianceState {
  const state: ComplianceState = {}
  TRUCK_COMPLIANCE_TYPES.forEach(({ key }) => {
    state[key] = { dueDate: '', attachment: null }
  })
  return state
}

interface TruckFormProps {
  truck?: Truck | null
  onSaved: () => void
}

function TruckForm({ truck, onSaved }: TruckFormProps) {
  const isEditMode = !!truck

  const [regNo, setRegNo] = useState(truck?.reg_no ?? '')
  const [capacity, setCapacity] = useState(truck?.capacity ?? '')
  const [trailerId, setTrailerId] = useState(truck?.trailer_id?.toString() ?? '')
  const [driverId, setDriverId] = useState(truck?.driver_id?.toString() ?? '')
  const [compliance, setCompliance] = useState<ComplianceState>(initialComplianceState())

  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrailers().then(setTrailers).catch(() => setTrailers([]))
    fetchDrivers().then(setDrivers).catch(() => setDrivers([]))
  }, [])

  function updateCompliance(key: string, field: keyof ComplianceFieldState, value: string | File | null) {
    setCompliance((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        reg_no: regNo,
        capacity,
        trailer_id: trailerId || undefined,
        driver_id: driverId || undefined,
      }

      const savedTruck = isEditMode
        ? await updateTruck(truck.id, payload)
        : await createTruck(payload)

      for (const { key } of TRUCK_COMPLIANCE_TYPES) {
        const { dueDate, attachment } = compliance[key]
        if (!dueDate) continue

        await createDocument('trucks', savedTruck.id, {
          document_type: key,
          expiry_date: dueDate,
          attachment,
        })
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save truck')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reg No</label>
          <input
            type="text"
            value={regNo}
            onChange={(e) => setRegNo(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (tons)</label>
          <input
            type="number"
            step="0.01"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Trailer</label>
          <select
            value={trailerId}
            onChange={(e) => setTrailerId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">— None —</option>
            {trailers.map((t) => (
              <option key={t.id} value={t.id}>{t.reg_no}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Driver</label>
          <select
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">— None —</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>{d.full_name}</option>
            ))}
          </select>
        </div>
      </div>

      {isEditMode && (
        <p className="text-xs text-gray-400 mb-4">
          Compliance documents below will be added as new entries. Editing existing documents comes in a future update.
        </p>
      )}

      <h3 className="text-sm font-bold text-gray-600 mb-3">Compliance Documents</h3>
      <div className="space-y-3 mb-6">
        {TRUCK_COMPLIANCE_TYPES.map(({ key, label }) => (
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
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Truck' : 'Save Truck'}
      </button>
    </form>
  )
}

export default TruckForm