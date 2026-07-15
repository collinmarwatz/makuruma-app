import { useEffect, useState } from 'react'
import type { TrackedTruck, Checkpoint, TrackingStatus } from '../types/tracking'
import { fetchCheckpoints, updateTrackingStatus, upsertMilestone } from '../services/trackingService'
import { TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'
import { Loader2, Check } from 'lucide-react'

interface TrackingDetailFormProps {
  truck: TrackedTruck
  onSaved: () => void
}

interface MilestoneInput {
  arrivalAt: string
  dispatchAt: string
}

function toDatetimeLocal(value: string | null): string {
  if (!value) return ''
  return value.slice(0, 16)
}

function TrackingDetailForm({ truck, onSaved }: TrackingDetailFormProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [location, setLocation] = useState(truck.current_location ?? '')
  const [status, setStatus] = useState<TrackingStatus>(truck.current_status)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)

  const [milestones, setMilestones] = useState<Record<number, MilestoneInput>>({})
  const [savingCheckpointId, setSavingCheckpointId] = useState<number | null>(null)
  const [savedCheckpointId, setSavedCheckpointId] = useState<number | null>(null)

  const recentBooking = truck.booking_trucks?.[0] ?? null

  useEffect(() => {
    fetchCheckpoints().then((data) => {
      setCheckpoints(data)
      const initial: Record<number, MilestoneInput> = {}
      data.forEach((cp) => {
        const existing = truck.milestones.find((m) => m.checkpoint.id === cp.id)
        initial[cp.id] = {
          arrivalAt: toDatetimeLocal(existing?.arrival_at ?? null),
          dispatchAt: toDatetimeLocal(existing?.dispatch_at ?? null),
        }
      })
      setMilestones(initial)
    }).catch(() => setCheckpoints([]))
  }, [truck])

  function updateMilestoneField(checkpointId: number, field: keyof MilestoneInput, value: string) {
    setMilestones((prev) => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], [field]: value },
    }))
  }

  async function handleStatusSave() {
    setIsSavingStatus(true)
    setStatusSaved(false)
    try {
      await updateTrackingStatus(truck.id, { current_location: location || undefined, current_status: status })
      setStatusSaved(true)
      onSaved()
    } finally {
      setIsSavingStatus(false)
    }
  }

  async function handleMilestoneSave(checkpointId: number) {
    setSavingCheckpointId(checkpointId)
    setSavedCheckpointId(null)
    try {
      const { arrivalAt, dispatchAt } = milestones[checkpointId]
      await upsertMilestone(truck.id, {
        checkpoint_id: checkpointId,
        arrival_at: arrivalAt || undefined,
        dispatch_at: dispatchAt || undefined,
      })
      setSavedCheckpointId(checkpointId)
      onSaved()
    } finally {
      setSavingCheckpointId(null)
    }
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="font-medium text-gray-800">
          {truck.reg_no} — {truck.trailer?.reg_no ?? 'no trailer'} — {truck.driver?.full_name ?? 'no driver'}
        </p>
        {recentBooking ? (
          <>
            <p className="text-sm text-gray-500 mt-1">Last booking: {recentBooking.trip_leg.trip.trip_number}</p>
            <p className="text-sm text-gray-500">
              {recentBooking.loading_point ?? '—'} → {recentBooking.offloading_point ?? '—'}
            </p>
          </>
        ) : (
          <p className="text-sm text-gray-400 mt-1">No bookings yet for this truck.</p>
        )}
      </div>

      <h3 className="text-sm font-bold text-gray-600 mb-3">Current Status</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Current Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Current Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as TrackingStatus)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            {TRACKING_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        type="button"
        onClick={handleStatusSave}
        disabled={isSavingStatus}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6"
      >
        {isSavingStatus ? <Loader2 size={14} className="animate-spin" /> : statusSaved ? <Check size={14} /> : null}
        {isSavingStatus ? 'Saving...' : statusSaved ? 'Saved' : 'Update Status'}
      </button>

      <h3 className="text-sm font-bold text-gray-600 mb-3">Checkpoint Milestones</h3>
      <div className="space-y-3">
        {checkpoints.map((cp) => (
          <div key={cp.id} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">{cp.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Arrival</label>
                <input
                  type="datetime-local"
                  value={milestones[cp.id]?.arrivalAt ?? ''}
                  onChange={(e) => updateMilestoneField(cp.id, 'arrivalAt', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dispatch</label>
                <input
                  type="datetime-local"
                  value={milestones[cp.id]?.dispatchAt ?? ''}
                  onChange={(e) => updateMilestoneField(cp.id, 'dispatchAt', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => handleMilestoneSave(cp.id)}
                disabled={savingCheckpointId === cp.id}
                className="flex items-center justify-center gap-1.5 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
              >
                {savingCheckpointId === cp.id ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : savedCheckpointId === cp.id ? (
                  <Check size={14} />
                ) : null}
                {savingCheckpointId === cp.id ? 'Saving...' : savedCheckpointId === cp.id ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TrackingDetailForm