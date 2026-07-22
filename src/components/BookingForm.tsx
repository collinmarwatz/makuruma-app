import { useEffect, useState, type FormEvent } from 'react'
import { createBooking, updateBooking, fetchEligibleTrucks, removeTruckFromBooking } from '../services/bookingService'
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

  const [removingTruckId, setRemovingTruckId] = useState<number | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)

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

  async function handleRemoveTruck(bookingTruckId: number, regNo: string) {
    if (!booking) return
    if (!window.confirm(`Remove ${regNo} from this booking? This frees the truck (e.g. after an accident or complication) but keeps all its expense/invoice history.`)) return

    setRemoveError(null)
    setRemovingTruckId(bookingTruckId)
    try {
      await removeTruckFromBooking(booking.id, bookingTruckId)
      onSaved()
    } catch (err) {
      setRemoveError(err instanceof Error ? err.message : 'Failed to remove truck')
    } finally {
      setRemovingTruckId(null)
    }
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
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">Transporter</label>
        <input type="text" value="Makuruma Logistics" disabled
          className="w-full ring-1 ring-border bg-muted rounded-lg px-3 py-2 text-sm text-muted-foreground" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Client</label>
          <select value={clientId} onChange={(e) => setClientId(e.target.value)} disabled={isEditMode}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground disabled:opacity-60">
            <option value="">— Select —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">ETA</label>
          <input type="date" value={eta} onChange={(e) => setEta(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Loading Point</label>
          <input type="text" value={loadingPoint} onChange={(e) => setLoadingPoint(e.target.value)}
            placeholder="Shared for all trucks" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Offloading Point</label>
          <input type="text" value={offloadingPoint} onChange={(e) => setOffloadingPoint(e.target.value)}
            placeholder="Shared for all trucks" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-1">Description of Goods/Services</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
          className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
      </div>

      <h3 className="text-sm font-semibold text-foreground mb-2">
        {isEditMode ? 'Trucks on this Booking' : `Select Truck(s) — ${direction === 'go' ? 'Off Duty' : 'Awaiting Return'} trucks only`}
      </h3>

      {!isEditMode && displayTrucks.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">No eligible trucks available for a {direction} booking right now.</p>
      )}

      {removeError && <p className="text-sm text-destructive mb-2">{removeError}</p>}

      <div className="space-y-2 mb-6">
        {displayTrucks.map((truck) => {
          const truckId = truck.id.toString()
          const checked = isEditMode || selectedTruckIds.includes(truckId)
          const bookingTruck = isEditMode ? booking!.booking_trucks.find((bt) => bt.truck.id === truck.id) : null

          return (
            <div key={truck.id} className="ring-1 ring-border rounded-lg overflow-hidden">
              <label className={`flex items-center gap-3 px-3 py-2 text-sm ${isEditMode ? '' : 'cursor-pointer hover:bg-surface'}`}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={isEditMode}
                  onChange={() => toggleTruck(truckId)}
                  className={isEditMode ? '' : 'cursor-pointer'}
                />
                <div className="flex-1">
                  <span className="font-medium text-foreground">{truck.reg_no}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    {truck.trailer?.reg_no ?? 'no trailer'} · {truck.capacity} tons · {truck.driver?.full_name ?? 'no driver'}
                  </span>
                </div>
              </label>

              {checked && (
                <div className="bg-surface p-3 border-t border-hairline">
                  <p className="text-xs text-muted-foreground mb-2">
                    License: {licenseOf(truck.driver)} · Passport: {passportOf(truck.driver)} · Contact: {truck.driver?.phone ?? '—'} · Current Location: {truck.current_location ?? '—'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Cargo</label>
                      <input type="text" value={truckLines[truckId]?.cargo ?? ''}
                        onChange={(e) => updateTruckLine(truckId, 'cargo', e.target.value)}
                        className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Rate ($/mt)</label>
                      <input type="number" step="0.01" value={truckLines[truckId]?.rate ?? ''}
                        onChange={(e) => updateTruckLine(truckId, 'rate', e.target.value)}
                        className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                    </div>
                  </div>

                  {isEditMode && bookingTruck && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTruck(bookingTruck.id, truck.reg_no)}
                      disabled={removingTruckId === bookingTruck.id}
                      className="mt-3 text-xs text-destructive hover:opacity-80 font-medium disabled:opacity-50"
                    >
                      {removingTruckId === bookingTruck.id ? 'Removing...' : `Remove ${truck.reg_no} from this booking`}
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (!isEditMode && direction === 'return' && displayTrucks.length === 0)}
        className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Booking' : 'Create Booking'}
      </button>
    </form>
  )
}

export default BookingForm