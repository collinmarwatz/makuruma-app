import { useEffect, useState, type FormEvent } from 'react'
import { createBooking, updateBooking, fetchEligibleTrucks } from '../services/bookingService'
import { fetchClients } from '../services/clientService'
import type { Client } from '../types/partner'
import type { Booking, EligibleTruck } from '../types/booking'
import type { Driver } from '../types/employee'
import { Loader2 } from 'lucide-react'

interface BookingFormProps {
  booking?: Booking | null
  direction?: 'go' | 'return'
  onSaved: () => void
}

interface TruckLineState {
  cargo: string
  rate: string
}

function licenseOf(driver: Driver | null): string {
  return driver?.documents?.find((d) => d.document_type === 'license')?.number ?? '—'
}
function passportOf(driver: Driver | null): string {
  return driver?.documents?.find((d) => d.document_type === 'passport')?.number ?? '—'
}

function BookingForm({ booking, direction = 'go', onSaved }: BookingFormProps) {
  const isEditMode = !!booking

  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(booking?.client.id.toString() ?? '')
  const [eta, setEta] = useState(booking?.eta?.slice(0, 10) ?? '') 
  const [loadingPoint, setLoadingPoint] = useState(booking?.loading_point ?? '')
  const [offloadingPoint, setOffloadingPoint] = useState(booking?.offloading_point ?? '')
  const [description, setDescription] = useState(booking?.description ?? '')

  const [eligibleTrucks, setEligibleTrucks] = useState<EligibleTruck[]>([])
  const [selectedTruckIds, setSelectedTruckIds] = useState<string[]>(
    booking?.booking_trucks.map((bt) => bt.truck.id.toString()) ?? []
  )
  const [truckLines, setTruckLines] = useState<Record<string, TruckLineState>>(() => {
    const initial: Record<string, TruckLineState> = {}
    booking?.booking_trucks.forEach((bt) => {
      initial[bt.truck.id.toString()] = { cargo: bt.cargo ?? '', rate: bt.rate ?? '' }
    })
    return initial
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients().then(setClients).catch(() => setClients([]))
  }, [])

  useEffect(() => {
    if (isEditMode) return
    fetchEligibleTrucks(direction).then(setEligibleTrucks).catch(() => setEligibleTrucks([]))
  }, [direction, isEditMode])

  const displayTrucks: EligibleTruck[] = isEditMode
    ? booking!.booking_trucks.map((bt) => ({ ...bt.truck, trailer: bt.trailer, driver: bt.driver }))
    : eligibleTrucks

  function toggleTruck(truckId: string) {
    setSelectedTruckIds((prev) =>
      prev.includes(truckId) ? prev.filter((id) => id !== truckId) : [...prev, truckId]
    )
    setTruckLines((prev) => (prev[truckId] ? prev : { ...prev, [truckId]: { cargo: '', rate: '' } }))
  }

  function updateTruckLine(truckId: string, field: keyof TruckLineState, value: string) {
    setTruckLines((prev) => ({ ...prev, [truckId]: { ...prev[truckId], [field]: value } }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isEditMode && !clientId) {
      setError('Select a client')
      return
    }
    if (!isEditMode && selectedTruckIds.length === 0) {
      setError('Select at least one truck')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && booking) {
        await updateBooking(booking.id, {
          eta: eta || undefined,
          loading_point: loadingPoint || undefined,
          offloading_point: offloadingPoint || undefined,
          description: description || undefined,
          trucks: booking.booking_trucks.map((bt) => ({
            booking_truck_id: bt.id.toString(),
            cargo: truckLines[bt.truck.id.toString()]?.cargo || undefined,
            rate: truckLines[bt.truck.id.toString()]?.rate || undefined,
          })),
        })
      } else {
        await createBooking({
          direction,
          client_id: clientId,
          eta: eta || undefined,
          loading_point: loadingPoint || undefined,
          offloading_point: offloadingPoint || undefined,
          description: description || undefined,
          truck_ids: selectedTruckIds,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Transporter</label>
        <input type="text" value="Makuruma Logistics" disabled
          className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={isEditMode}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm disabled:bg-gray-50">
            <option value="">— Select —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ETA</label>
          <input type="date" value={eta} onChange={(e) => setEta(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Loading Point</label>
          <input type="text" value={loadingPoint} onChange={(e) => setLoadingPoint(e.target.value)}
            placeholder="Shared for all trucks" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Offloading Point</label>
          <input type="text" value={offloadingPoint} onChange={(e) => setOffloadingPoint(e.target.value)}
            placeholder="Shared for all trucks" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description of Goods/Services</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
      </div>

      <h3 className="text-sm font-bold text-gray-600 mb-2">
        {isEditMode ? 'Trucks on this Booking' : `Select Truck(s) — ${direction === 'go' ? 'Off Duty' : 'Awaiting Return'} trucks only`}
      </h3>

      {!isEditMode && displayTrucks.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">No eligible trucks available for a {direction} booking right now.</p>
      )}

      <div className="space-y-2 mb-6">
        {displayTrucks.map((truck) => {
          const truckId = truck.id.toString()
          const checked = isEditMode || selectedTruckIds.includes(truckId)

          return (
            <div key={truck.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <label className={`flex items-center gap-3 px-3 py-2 text-sm ${isEditMode ? '' : 'cursor-pointer hover:bg-gray-50'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isEditMode}
                  onChange={() => toggleTruck(truckId)}
                  className={isEditMode ? '' : 'cursor-pointer'}
                />
                <div className="flex-1">
                  <span className="font-medium text-gray-800">{truck.reg_no}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {truck.trailer?.reg_no ?? 'no trailer'} · {truck.capacity} tons · {truck.driver?.full_name ?? 'no driver'}
                  </span>
                </div>
              </label>

              {checked && (
                <div className="bg-gray-50 p-3 border-t border-gray-200">
                  <p className="text-xs text-gray-400 mb-2">
                    License: {licenseOf(truck.driver)} · Passport: {passportOf(truck.driver)} · Contact: {truck.driver?.phone ?? '—'} · Current Location: {truck.current_location ?? '—'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Cargo</label>
                      <input type="text" value={truckLines[truckId]?.cargo ?? ''}
                        onChange={(e) => updateTruckLine(truckId, 'cargo', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Rate ($/mt)</label>
                      <input type="number" step="0.01" value={truckLines[truckId]?.rate ?? ''}
                        onChange={(e) => updateTruckLine(truckId, 'rate', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
      </button>
    </form>
  )
}

export default BookingForm