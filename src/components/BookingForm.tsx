import { useEffect, useState, type FormEvent } from 'react'
import {
  createBooking,
  findTripByNumber,
  addTripLeg,
  updateTripLeg,
  type TruckAssignment,
} from '../services/tripService'
import { fetchTrucks } from '../services/truckService'
import { fetchTrailers } from '../services/trailerService'
import { fetchDrivers } from '../services/driverService'
import { fetchClients } from '../services/clientService'
import type { Truck } from '../types/truck'
import type { Trailer } from '../types/trailer'
import type { Driver } from '../types/employee'
import type { Client } from '../types/partner'
import type { Trip } from '../types/trip'
import { Loader2, Search } from 'lucide-react'

interface BookingFormProps {
  trip?: Trip | null
  onSaved: () => void
}

type Mode = 'go' | 'return'

interface SelectedTruck {
  truckId: string
  trailerId: string
  driverId: string
  capacityOverride: string
  cargo: string
  loadingPoint: string
  loadingPointArrivalDate: string
  offloadingPoint: string
  offloadingDate: string
  invoicedTransitWeight: string
  invoicedDetentionCharge: string
}

function BookingForm({ trip, onSaved }: BookingFormProps) {
  const isEditMode = !!trip
  const goLeg = trip?.legs.find((leg) => leg.direction === 'go') ?? null

  const [mode, setMode] = useState<Mode>('go')

  const [trucks, setTrucks] = useState<Truck[]>([])
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrucks().then(setTrucks).catch(() => setTrucks([]))
    fetchTrailers().then(setTrailers).catch(() => setTrailers([]))
    fetchDrivers().then(setDrivers).catch(() => setDrivers([]))
    fetchClients().then(setClients).catch(() => setClients([]))
  }, [])

  const [selectedTrucks, setSelectedTrucks] = useState<SelectedTruck[]>(
    goLeg?.booking_trucks.map((bt) => ({
      truckId: bt.truck.id.toString(),
      trailerId: bt.trailer?.id.toString() ?? '',
      driverId: bt.driver?.id.toString() ?? '',
      capacityOverride: bt.capacity_override ?? '',
      cargo: bt.cargo ?? '',
      loadingPoint: bt.loading_point ?? '',
      loadingPointArrivalDate: bt.loading_point_arrival_date ?? '',
      offloadingPoint: bt.offloading_point ?? '',
      offloadingDate: bt.offloading_date ?? '',
      invoicedTransitWeight: bt.invoiced_transit_weight ?? '',
      invoicedDetentionCharge: bt.invoiced_detention_charge ?? '',
    })) ?? []
  )

  const [clientId, setClientId] = useState(goLeg?.client?.id.toString() ?? '')
  const [rate, setRate] = useState(goLeg?.rate ?? '')
  const [eta, setEta] = useState(goLeg?.eta ?? '')
  const [location, setLocation] = useState(goLeg?.location ?? '')
  const [itemSn, setItemSn] = useState(goLeg?.item_sn ?? '')
  const [description, setDescription] = useState(goLeg?.description ?? '')
  const [quantity, setQuantity] = useState(goLeg?.quantity ?? '')
  const [amount, setAmount] = useState(goLeg?.amount ?? '')

  const [tripNumberInput, setTripNumberInput] = useState('')
  const [foundTrip, setFoundTrip] = useState<Trip | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [isLookingUp, setIsLookingUp] = useState(false)

  function toggleTruck(truckId: string) {
    const exists = selectedTrucks.some((s) => s.truckId === truckId)

    if (exists) {
      setSelectedTrucks((prev) => prev.filter((s) => s.truckId !== truckId))
      return
    }

    const truck = trucks.find((t) => t.id.toString() === truckId)
    setSelectedTrucks((prev) => [
      ...prev,
      {
        truckId,
        trailerId: truck?.trailer?.id.toString() ?? '',
        driverId: truck?.driver?.id.toString() ?? '',
        capacityOverride: '',
        cargo: '',
        loadingPoint: '',
        loadingPointArrivalDate: '',
        offloadingPoint: '',
        offloadingDate: '',
        invoicedTransitWeight: '',
        invoicedDetentionCharge: '',
      },
    ])
  }

  function updateSelectedTruck(truckId: string, field: keyof SelectedTruck, value: string) {
    setSelectedTrucks((prev) =>
      prev.map((s) => (s.truckId === truckId ? { ...s, [field]: value } : s))
    )
  }

  function resetLegFields() {
    setClientId('')
    setRate('')
    setEta('')
    setLocation('')
    setItemSn('')
    setDescription('')
    setQuantity('')
    setAmount('')
    setSelectedTrucks([])
    setFoundTrip(null)
    setTripNumberInput('')
  }

  async function handleLookup() {
    setLookupError(null)
    setFoundTrip(null)
    setIsLookingUp(true)
    try {
      const found = await findTripByNumber(tripNumberInput.trim())
      setFoundTrip(found)
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Trip not found')
    } finally {
      setIsLookingUp(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (selectedTrucks.length === 0) {
      setError('Select at least one truck')
      return
    }

    setIsSubmitting(true)

    const truckAssignments: TruckAssignment[] = selectedTrucks.map((s) => ({
      truck_id: s.truckId,
      trailer_id: s.trailerId || undefined,
      driver_id: s.driverId || undefined,
      capacity_override: s.capacityOverride || undefined,
      cargo: s.cargo || undefined,
      loading_point: s.loadingPoint || undefined,
      loading_point_arrival_date: s.loadingPointArrivalDate || undefined,
      offloading_point: s.offloadingPoint || undefined,
      offloading_date: s.offloadingDate || undefined,
      invoiced_transit_weight: s.invoicedTransitWeight || undefined,
      invoiced_detention_charge: s.invoicedDetentionCharge || undefined,
    }))

    const legPayload = {
      trucks: truckAssignments,
      client_id: clientId || undefined,
      rate: rate || undefined,
      eta: eta || undefined,
      location: location || undefined,
      item_sn: itemSn || undefined,
      description: description || undefined,
      quantity: quantity || undefined,
      amount: amount || undefined,
    }

    try {
      if (isEditMode && goLeg) {
        await updateTripLeg(goLeg.id, legPayload)
      } else if (mode === 'go') {
        await createBooking(legPayload)
      } else {
        if (!foundTrip) {
          setError('Please look up a valid trip number first')
          setIsSubmitting(false)
          return
        }
        await addTripLeg(foundTrip.id, 'return', legPayload)
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showTruckSelector = isEditMode || mode === 'go' || (mode === 'return' && foundTrip !== null)

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      {!isEditMode && (
        <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => { setMode('go'); resetLegFields() }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'go' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'
            }`}
          >
            Go (New Booking)
          </button>
          <button
            type="button"
            onClick={() => { setMode('return'); resetLegFields() }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              mode === 'return' ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'
            }`}
          >
            Return (Existing Booking)
          </button>
        </div>
      )}

      {!isEditMode && mode === 'return' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Booking Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tripNumberInput}
              onChange={(e) => setTripNumberInput(e.target.value)}
              placeholder="e.g. 1T111AAA"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={handleLookup}
              disabled={isLookingUp || !tripNumberInput}
              className="flex items-center gap-1.5 bg-gray-100 text-gray-700 px-4 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isLookingUp ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Find
            </button>
          </div>

          {lookupError && <p className="text-sm text-red-600 mt-2">{lookupError}</p>}

          {foundTrip && (
            <div className="mt-3 bg-green-50 border border-green-100 rounded-lg p-3 text-sm">
              <p className="font-medium text-green-800">Booking found: {foundTrip.trip_number}</p>
              <p className="text-green-700">
                Now select the truck(s) for the return leg below — these can be different from the Go trucks.
              </p>
            </div>
          )}
        </div>
      )}

      {showTruckSelector && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Truck(s) for this {isEditMode || mode === 'go' ? 'Go' : 'Return'} Leg
          </label>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-40 overflow-y-auto">
            {trucks.map((t) => (
              <label key={t.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedTrucks.some((s) => s.truckId === t.id.toString())}
                  onChange={() => toggleTruck(t.id.toString())}
                  className="cursor-pointer"
                />
                <span className="font-medium text-gray-800">{t.reg_no}</span>
                <span className="text-gray-400 text-xs">
                  {t.trailer?.reg_no ?? 'no trailer'} · {t.driver?.full_name ?? 'no driver'}
                </span>
              </label>
            ))}
          </div>

          {selectedTrucks.length > 0 && (
            <div className="mt-4 space-y-4">
              {selectedTrucks.map((s) => {
                const truck = trucks.find((t) => t.id.toString() === s.truckId)
                return (
                  <div key={s.truckId} className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">{truck?.reg_no}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Trailer</label>
                        <select
                          value={s.trailerId}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'trailerId', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        >
                          <option value="">— None —</option>
                          {trailers.map((tr) => <option key={tr.id} value={tr.id}>{tr.reg_no}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Driver</label>
                        <select
                          value={s.driverId}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'driverId', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        >
                          <option value="">— None —</option>
                          {drivers.map((d) => <option key={d.id} value={d.id}>{d.full_name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Capacity Override</label>
                        <input
                          type="number"
                          step="0.01"
                          value={s.capacityOverride}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'capacityOverride', e.target.value)}
                          placeholder="Truck default"
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Cargo</label>
                        <input
                          type="text"
                          value={s.cargo}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'cargo', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Loading Point</label>
                        <input
                          type="text"
                          value={s.loadingPoint}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'loadingPoint', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Loading Arrival Date</label>
                        <input
                          type="date"
                          value={s.loadingPointArrivalDate}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'loadingPointArrivalDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Offloading Point</label>
                        <input
                          type="text"
                          value={s.offloadingPoint}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'offloadingPoint', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Offloading Date</label>
                        <input
                          type="date"
                          value={s.offloadingDate}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'offloadingDate', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Invoiced Transit Weight</label>
                        <input
                          type="number"
                          step="0.01"
                          value={s.invoicedTransitWeight}
                          onChange={(e) => updateSelectedTruck(s.truckId, 'invoicedTransitWeight', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs text-gray-500 mb-1">Invoiced Detention Charge</label>
                      <input
                        type="number"
                        step="0.01"
                        value={s.invoicedDetentionCharge}
                        onChange={(e) => updateSelectedTruck(s.truckId, 'invoicedDetentionCharge', e.target.value)}
                        className="w-full md:w-1/3 border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <h3 className="text-sm font-bold text-gray-600 mb-3">
        {isEditMode || mode === 'go' ? 'Go Leg Details' : 'Return Leg Details'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">— None —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rate ($/mt)</label>
          <input
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => setRate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ETA</label>
          <input
            type="date"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item S/N</label>
          <input
            type="text"
            value={itemSn}
            onChange={(e) => setItemSn(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
          <input
            type="number"
            step="0.01"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description of Goods/Services</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || (!isEditMode && mode === 'return' && !foundTrip)}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting
          ? 'Saving...'
          : isEditMode
            ? 'Update Booking'
            : mode === 'go'
              ? 'Create Booking'
              : 'Add Return Leg'}
      </button>
    </form>
  )
}

export default BookingForm