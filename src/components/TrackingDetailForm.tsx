import { useEffect, useState } from 'react'
import type { TrackedTruck, Checkpoint, TrackingStatus } from '../types/tracking'
import { fetchCheckpoints, updateTrackingStatus, upsertMilestone, updateTripDates, uploadProofOfDelivery } from '../services/trackingService'
import { TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'
import { Loader2, Check, Upload, FileCheck } from 'lucide-react'

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
  const recentBooking = truck.booking_trucks?.[0] ?? null

  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([])
  const [location, setLocation] = useState(truck.current_location ?? '')
  const [status, setStatus] = useState<TrackingStatus>(truck.current_status)
  const [isSavingStatus, setIsSavingStatus] = useState(false)
  const [statusSaved, setStatusSaved] = useState(false)
  const [statusError, setStatusError] = useState<string | null>(null)

  const [loadingPointArrivalDate, setLoadingPointArrivalDate] = useState(recentBooking?.loading_point_arrival_date?.slice(0, 10) ?? '')
  const [loadingDate, setLoadingDate] = useState(recentBooking?.loading_date?.slice(0, 10) ?? '')
  const [loadingDispatchDate, setLoadingDispatchDate] = useState(recentBooking?.loading_dispatch_date?.slice(0, 10) ?? '')
  const [offloadingPointArrivalDate, setOffloadingPointArrivalDate] = useState(recentBooking?.offloading_point_arrival_date?.slice(0, 10) ?? '')
  const [offloadingDate, setOffloadingDate] = useState(recentBooking?.offloading_date?.slice(0, 10) ?? '')
  const [isSavingDates, setIsSavingDates] = useState(false)
  const [datesSaved, setDatesSaved] = useState(false)
  const [datesError, setDatesError] = useState<string | null>(null)

  const [podFile, setPodFile] = useState<File | null>(null)
  const [isUploadingPod, setIsUploadingPod] = useState(false)
  const [podError, setPodError] = useState<string | null>(null)

  const [milestones, setMilestones] = useState<Record<number, MilestoneInput>>({})
  const [savingCheckpointId, setSavingCheckpointId] = useState<number | null>(null)
  const [savedCheckpointId, setSavedCheckpointId] = useState<number | null>(null)
  const [milestoneError, setMilestoneError] = useState<string | null>(null)

  useEffect(() => {
    fetchCheckpoints().then((data) => {
      const ordered = truck.trip_status === 'return' ? [...data].reverse() : data
      setCheckpoints(ordered)
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
    setMilestones((prev) => ({ ...prev, [checkpointId]: { ...prev[checkpointId], [field]: value } }))
  }

  async function handleStatusSave() {
    setIsSavingStatus(true)
    setStatusSaved(false)
    setStatusError(null)
    try {
      await updateTrackingStatus(truck.id, { current_location: location || undefined, current_status: status })
      setStatusSaved(true)
      onSaved()
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Failed to update status')
    } finally {
      setIsSavingStatus(false)
    }
  }

  async function handleDatesSave() {
    if (!recentBooking) return
    setIsSavingDates(true)
    setDatesSaved(false)
    setDatesError(null)
    try {
      await updateTripDates(recentBooking.id, {
        loading_point_arrival_date: loadingPointArrivalDate || undefined,
        loading_date: loadingDate || undefined,
        loading_dispatch_date: loadingDispatchDate || undefined,
        offloading_point_arrival_date: offloadingPointArrivalDate || undefined,
        offloading_date: offloadingDate || undefined,
      })
      setDatesSaved(true)
      onSaved()
    } catch (err) {
      setDatesError(err instanceof Error ? err.message : 'Failed to save dates')
    } finally {
      setIsSavingDates(false)
    }
  }

  async function handlePodUpload() {
    if (!recentBooking || !podFile) return
    setPodError(null)
    setIsUploadingPod(true)
    try {
      await uploadProofOfDelivery(recentBooking.id, podFile)
      setPodFile(null)
      onSaved()
    } catch (err) {
      setPodError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploadingPod(false)
    }
  }

  async function handleMilestoneSave(checkpointId: number) {
    setSavingCheckpointId(checkpointId)
    setSavedCheckpointId(null)
    setMilestoneError(null)
    try {
      const { arrivalAt, dispatchAt } = milestones[checkpointId]
      await upsertMilestone(truck.id, {
        checkpoint_id: checkpointId,
        arrival_at: arrivalAt || undefined,
        dispatch_at: dispatchAt || undefined,
      })
      setSavedCheckpointId(checkpointId)
      onSaved()
    } catch (err) {
      setMilestoneError(err instanceof Error ? err.message : 'Failed to save milestone')
    } finally {
      setSavingCheckpointId(null)
    }
  }

  return (
    <div>
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <p className="font-medium text-gray-800">
          {recentBooking?.trip?.trip_code ?? truck.reg_no} — {truck.trailer?.reg_no ?? 'no trailer'} — {truck.driver?.full_name ?? 'no driver'}
        </p>
        {recentBooking ? (
          <>
            <p className="text-sm text-gray-500 mt-1">Client: {recentBooking.booking.client?.company_name ?? '—'}</p>
            <p className="text-sm text-gray-500">
              {recentBooking.booking.loading_point ?? '—'} → {recentBooking.booking.offloading_point ?? '—'}
            </p>
            {recentBooking.is_overdue && (
              <p className="text-sm text-red-600 font-medium mt-1">⚠ Past ETA — not yet completed</p>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-400 mt-1">No bookings yet for this truck.</p>
        )}
      </div>

      <h3 className="text-sm font-bold text-gray-600 mb-3">Current Status</h3>
      {statusError && <p className="text-sm text-red-600 mb-2">{statusError}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Current Location</label>
          <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Current Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as TrackingStatus)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {TRACKING_STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      </div>
      <button type="button" onClick={handleStatusSave} disabled={isSavingStatus}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6">
        {isSavingStatus ? <Loader2 size={14} className="animate-spin" /> : statusSaved ? <Check size={14} /> : null}
        {isSavingStatus ? 'Saving...' : statusSaved ? 'Saved' : 'Update Status'}
      </button>

      {recentBooking && (
        <>
          <h3 className="text-sm font-bold text-gray-600 mb-3">Loading & Offloading Dates</h3>
          {datesError && <p className="text-sm text-red-600 mb-2">{datesError}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Arriving Loading Point</label>
              <input type="date" value={loadingPointArrivalDate} onChange={(e) => setLoadingPointArrivalDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Loading</label>
              <input type="date" value={loadingDate} onChange={(e) => setLoadingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date of Dispatch</label>
              <input type="date" value={loadingDispatchDate} onChange={(e) => setLoadingDispatchDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Arrival at Offloading Point</label>
              <input type="date" value={offloadingPointArrivalDate} onChange={(e) => setOffloadingPointArrivalDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Date Offloading</label>
              <input type="date" value={offloadingDate} onChange={(e) => setOffloadingDate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="button" onClick={handleDatesSave} disabled={isSavingDates}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 mb-6">
            {isSavingDates ? <Loader2 size={14} className="animate-spin" /> : datesSaved ? <Check size={14} /> : null}
            {isSavingDates ? 'Saving...' : datesSaved ? 'Saved' : 'Save Dates'}
          </button>

          <h3 className="text-sm font-bold text-gray-600 mb-3">Proof of Delivery</h3>
          {recentBooking.documents.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2 mb-3">
              <FileCheck size={16} />
              {recentBooking.documents.length} file(s) already uploaded
            </div>
          )}
          {podError && <p className="text-sm text-red-600 mb-2">{podError}</p>}
          <div className="flex gap-2 mb-6">
            <input type="file" onChange={(e) => setPodFile(e.target.files?.[0] ?? null)}
              className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2" />
            <button type="button" onClick={handlePodUpload} disabled={!podFile || isUploadingPod}
              className="flex items-center gap-1.5 bg-gray-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50">
              {isUploadingPod ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              Upload
            </button>
          </div>
        </>
      )}

      <h3 className="text-sm font-bold text-gray-600 mb-3">
        Checkpoint Milestones {truck.trip_status === 'return' && <span className="font-normal text-gray-400">(Return order)</span>}
      </h3>
      {milestoneError && <p className="text-sm text-red-600 mb-2">{milestoneError}</p>}
      <div className="space-y-3">
        {checkpoints.map((cp) => (
          <div key={cp.id} className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm font-medium text-gray-700 mb-2">{cp.name}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Arrival</label>
                <input type="datetime-local" value={milestones[cp.id]?.arrivalAt ?? ''}
                  onChange={(e) => updateMilestoneField(cp.id, 'arrivalAt', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dispatch</label>
                <input type="datetime-local" value={milestones[cp.id]?.dispatchAt ?? ''}
                  onChange={(e) => updateMilestoneField(cp.id, 'dispatchAt', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
              <button type="button" onClick={() => handleMilestoneSave(cp.id)} disabled={savingCheckpointId === cp.id}
                className="flex items-center justify-center gap-1.5 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50">
                {savingCheckpointId === cp.id ? <Loader2 size={14} className="animate-spin" /> : savedCheckpointId === cp.id ? <Check size={14} /> : null}
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