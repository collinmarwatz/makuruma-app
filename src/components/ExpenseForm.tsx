import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { createExpenseOrder, updateExpenseOrder, type ExpenseLineInput } from '../services/expenseService'
import { fetchTrips } from '../services/tripService'
import { fetchTrucks } from '../services/truckService'
import type { ExpenseOrder, ExpenseCategory } from '../types/expense'
import type { Trip } from '../types/trip'
import type { Truck } from '../types/truck'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface ExpenseFormProps {
  expense?: ExpenseOrder | null
  onSaved: () => void
}

function ExpenseForm({ expense, onSaved }: ExpenseFormProps) {
  const isEditMode = !!expense

  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'trip')
  const [tripId, setTripId] = useState(expense?.trip?.id.toString() ?? '')
  const [truckId, setTruckId] = useState(expense?.truck?.id.toString() ?? '')
  const [selectedTruckIds, setSelectedTruckIds] = useState<string[]>(
    expense?.trucks.map((t) => t.id.toString()) ?? []
  )

  const [lines, setLines] = useState<ExpenseLineInput[]>(
    expense?.lines.map((l) => ({ description: l.description, amount: l.amount })) ?? [
      { description: '', amount: '' },
    ]
  )

  const [trips, setTrips] = useState<Trip[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips().then(setTrips).catch(() => setTrips([]))
    fetchTrucks().then(setTrucks).catch(() => setTrucks([]))
  }, [])

  // Every truck that belongs to the selected trip (across Go and Return legs), deduplicated
  const tripTrucks = useMemo(() => {
    const trip = trips.find((t) => t.id.toString() === tripId)
    if (!trip) return []

    const seen = new Map<number, Truck>()
    trip.legs.forEach((leg) => {
      leg.booking_trucks.forEach((bt) => {
        seen.set(bt.truck.id, bt.truck)
      })
    })
    return Array.from(seen.values())
  }, [trips, tripId])

  function toggleTruck(id: string) {
    setSelectedTruckIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    )
  }

  const lineTotal = lines.reduce((sum, l) => sum + (parseFloat(l.amount) || 0), 0)
  const truckMultiplier = category === 'trip' && selectedTruckIds.length > 0 ? selectedTruckIds.length : 1
  const total = lineTotal * truckMultiplier

  function updateLine(index: number, field: keyof ExpenseLineInput, value: string) {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)))
  }

  function addLine() {
    setLines((prev) => [...prev, { description: '', amount: '' }])
  }

  function removeLine(index: number) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const validLines = lines.filter((l) => l.description.trim() && l.amount)
    if (validLines.length === 0) {
      setError('Add at least one expense line with a description and amount')
      return
    }

    if (category === 'trip' && !tripId) {
      setError('Select a trip for a Trip category expense')
      return
    }
    if (category === 'truck' && !truckId) {
      setError('Select a truck for a Truck category expense')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && expense) {
        await updateExpenseOrder(expense.id, validLines)
      } else {
        await createExpenseOrder({
          category,
          trip_id: category === 'trip' ? tripId : undefined,
          truck_id: category === 'truck' ? truckId : undefined,
          trucks: category === 'trip' && selectedTruckIds.length > 0 ? selectedTruckIds : undefined,
          lines: validLines,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save expense')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      {!isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as ExpenseCategory)
                setSelectedTruckIds([])
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="trip">Trip</option>
              <option value="office">Office</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          {category === 'trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trip / Booking</label>
              <select
                value={tripId}
                onChange={(e) => { setTripId(e.target.value); setSelectedTruckIds([]) }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">— Select —</option>
                {trips.map((t) => <option key={t.id} value={t.id}>{t.trip_number}</option>)}
              </select>
            </div>
          )}

          {category === 'truck' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Truck</label>
              <select
                value={truckId}
                onChange={(e) => setTruckId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">— Select —</option>
                {trucks.map((t) => <option key={t.id} value={t.id}>{t.reg_no}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      {!isEditMode && category === 'trip' && tripId && tripTrucks.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Apply this expense to specific truck(s) — optional. Amounts below are treated as PER TRUCK; the total will multiply by how many trucks you select.
          </label>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-32 overflow-y-auto">
            {tripTrucks.map((t) => (
              <label key={t.id} className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedTruckIds.includes(t.id.toString())}
                  onChange={() => toggleTruck(t.id.toString())}
                  className="cursor-pointer"
                />
                <span className="font-medium text-gray-800">{t.reg_no}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <h3 className="text-sm font-bold text-gray-600 mb-3">Expense Lines</h3>
      <div className="space-y-2 mb-2">
        {lines.map((line, index) => (
          <div key={index} className="flex gap-2 items-start">
            <input
              type="text"
              value={line.description}
              onChange={(e) => updateLine(index, 'description', e.target.value)}
              placeholder="Description (e.g. Fuel, Toll fees)"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            <input
              type="number"
              step="0.01"
              value={line.amount}
              onChange={(e) => updateLine(index, 'amount', e.target.value)}
              placeholder="Amount"
              className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
            {lines.length > 1 && (
              <button
                type="button"
                onClick={() => removeLine(index)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addLine}
        className="flex items-center gap-1.5 text-sm text-blue-600 font-medium hover:text-blue-700 mb-4"
      >
        <Plus size={14} />
        Add another line
      </button>

      <div className="bg-gray-50 rounded-lg p-3 mb-6">
        <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
          <span>Per-truck amount</span>
          <span>{lineTotal.toLocaleString()} TZS</span>
        </div>
        {truckMultiplier > 1 && (
          <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
            <span>× {truckMultiplier} trucks</span>
            <span></span>
          </div>
        )}
        <div className="flex justify-between items-center border-t border-gray-200 pt-2 mt-1">
          <span className="text-sm font-medium text-gray-700">Total</span>
          <span className="text-lg font-bold text-gray-800">{total.toLocaleString()} TZS</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Expense' : 'Create Expense Order'}
      </button>
    </form>
  )
}

export default ExpenseForm