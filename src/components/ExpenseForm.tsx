import { useEffect, useState, type FormEvent } from 'react'
import {
  createExpenseOrder,
  updateExpenseOrder,
  type ExpenseLineInput,
} from '../services/expenseService'
import { fetchTrips } from '../services/tripService'
import { fetchTrucks } from '../services/truckService'
import { fetchVendors } from '../services/vendorService'
import type { ExpenseOrder, ExpenseCategory, LineCategory, Currency } from '../types/expense'
import type { Trip } from '../types/trip'
import type { Truck } from '../types/truck'
import type { Vendor } from '../types/partner'
import { LINE_CATEGORIES, CURRENCIES } from '../constants/expenseLineCategories'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface ExpenseFormProps {
  expense?: ExpenseOrder | null
  onSaved: () => void
}

const ALL_TRUCKS = '__all__'

interface LineRow {
  key: string
  lineCategory: LineCategory
  vendorId: string
  bookingTruckSelection: string
  description: string
  currency: Currency
  exchangeRate: string
  originalAmount: string
}

function newRow(category: LineCategory): LineRow {
  return {
    key: Math.random().toString(36).slice(2),
    lineCategory: category,
    vendorId: '',
    bookingTruckSelection: ALL_TRUCKS,
    description: '',
    currency: 'TZS',
    exchangeRate: '1',
    originalAmount: '',
  }
}

function ExpenseForm({ expense, onSaved }: ExpenseFormProps) {
  const isEditMode = !!expense

  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'trip')
  const [tripId, setTripId] = useState(expense?.trip?.id.toString() ?? '')
  const [truckId, setTruckId] = useState(expense?.truck?.id.toString() ?? '')

  const [paymentAccount, setPaymentAccount] = useState(expense?.payment_account ?? '')
  const [initiatedBy, setInitiatedBy] = useState(expense?.initiated_by ?? '')
  const [paymentDate, setPaymentDate] = useState(expense?.payment_date?.slice(0, 10) ?? '')

  const [rows, setRows] = useState<LineRow[]>(() =>
    expense?.lines.map((l) => ({
      key: Math.random().toString(36).slice(2),
      lineCategory: l.line_category,
      vendorId: l.vendor?.id.toString() ?? '',
      bookingTruckSelection: l.booking_truck?.id.toString() ?? '',
      description: l.description,
      currency: l.currency,
      exchangeRate: l.exchange_rate,
      originalAmount: l.original_amount,
    })) ?? [newRow('fuel')]
  )

  const [trips, setTrips] = useState<Trip[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTrips().then(setTrips).catch(() => setTrips([]))
    fetchTrucks().then(setTrucks).catch(() => setTrucks([]))
    fetchVendors().then(setVendors).catch(() => setVendors([]))
  }, [])

  const fuelVendors = vendors.filter((v) => v.vendor_type === 'fuel')

  const selectedTrip = trips.find((t) => t.id.toString() === tripId)
  const tripTrucks = selectedTrip?.legs.flatMap((leg) => leg.booking_trucks) ?? []

  function addRow(cat: LineCategory) {
    setRows((prev) => [...prev, newRow(cat)])
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  function updateRow(key: string, field: keyof LineRow, value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  }

  function computeTzs(row: LineRow): number {
    const original = parseFloat(row.originalAmount) || 0
    const rate = row.currency === 'TZS' ? 1 : (parseFloat(row.exchangeRate) || 0)
    return original * rate
  }

  const total = rows.reduce((sum, r) => {
  const rowAmount = computeTzs(r)
  const multiplier = category === 'trip' && r.bookingTruckSelection === ALL_TRUCKS
    ? Math.max(tripTrucks.length, 1)
    : 1
  return sum + rowAmount * multiplier
}, 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    const validRows = rows.filter((r) => r.description.trim() && r.originalAmount)
    if (validRows.length === 0) {
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

    const lines: ExpenseLineInput[] = validRows.flatMap((r) => {
  const groupKey = crypto.randomUUID()

  const base = {
    line_category: r.lineCategory,
    vendor_id: r.vendorId || undefined,
    description: r.description,
    currency: r.currency,
    exchange_rate: r.currency === 'TZS' ? '1' : r.exchangeRate,
    original_amount: r.originalAmount,
    group_key: groupKey,
  }

  if (category === 'trip' && r.bookingTruckSelection === ALL_TRUCKS) {
    return tripTrucks.map((bt) => ({ ...base, booking_truck_id: bt.id.toString() }))
  }

  return [{ ...base, booking_truck_id: r.bookingTruckSelection || undefined }]
})

    try {
      if (isEditMode && expense) {
        await updateExpenseOrder(expense.id, {
          payment_account: paymentAccount || undefined,
          initiated_by: initiatedBy || undefined,
          payment_date: paymentDate || undefined,
          lines,
        })
      } else {
        await createExpenseOrder({
          category,
          trip_id: category === 'trip' ? tripId : undefined,
          truck_id: category === 'truck' ? truckId : undefined,
          payment_account: paymentAccount || undefined,
          initiated_by: initiatedBy || undefined,
          payment_date: paymentDate || undefined,
          lines,
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
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
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
              <select value={tripId} onChange={(e) => setTripId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">— Select —</option>
                {trips.map((t) => <option key={t.id} value={t.id}>{t.trip_number}</option>)}
              </select>
            </div>
          )}

          {category === 'truck' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Truck</label>
              <select value={truckId} onChange={(e) => setTruckId(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">— Select —</option>
                {trucks.map((t) => <option key={t.id} value={t.id}>{t.reg_no}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Account</label>
          <input type="text" value={paymentAccount} onChange={(e) => setPaymentAccount(e.target.value)}
            placeholder="e.g. CRDB - 0123456" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Initiated By</label>
          <input type="text" value={initiatedBy} onChange={(e) => setInitiatedBy(e.target.value)}
            placeholder="Name of person" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      {category === 'trip' && tripId && tripTrucks.length === 0 && (
        <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2 mb-4">
          This trip has no trucks assigned yet — expense lines will apply generally to the trip.
        </p>
      )}

      {LINE_CATEGORIES.map((cat) => {
        const catRows = rows.filter((r) => r.lineCategory === cat.value)
        return (
          <div key={cat.value} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-gray-600">{cat.label}</h3>
              <button type="button" onClick={() => addRow(cat.value)} className="flex items-center gap-1 text-xs text-blue-600 font-medium hover:text-blue-700">
                <Plus size={12} /> Add line
              </button>
            </div>

            {catRows.length === 0 ? (
              <p className="text-xs text-gray-400">No lines yet.</p>
            ) : (
              <div className="space-y-2">
                {catRows.map((row) => (
                  <div key={row.key} className="bg-gray-50 rounded-lg p-3">
                    {/* Row A: identity fields */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      {cat.needsVendor && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Vendor</label>
                          <select value={row.vendorId} onChange={(e) => updateRow(row.key, 'vendorId', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                            <option value="">— Select —</option>
                            {fuelVendors.map((v) => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                          </select>
                        </div>
                      )}

                      {category === 'trip' && tripTrucks.length > 0 && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Applies To</label>
                          <select value={row.bookingTruckSelection} onChange={(e) => updateRow(row.key, 'bookingTruckSelection', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                            <option value={ALL_TRUCKS}>All Trucks in this Trip</option>
                            {tripTrucks.map((bt) => (
                              <option key={bt.id} value={bt.id}>{bt.truck.reg_no} only</option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={cat.needsVendor || (category === 'trip' && tripTrucks.length > 0) ? '' : 'md:col-span-3'}>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <input type="text" value={row.description} onChange={(e) => updateRow(row.key, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                    </div>

                    {/* Row B: money fields */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 items-end">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Currency</label>
                        <select value={row.currency} onChange={(e) => updateRow(row.key, 'currency', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                          {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                      {row.currency !== 'TZS' && (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Exchange Rate</label>
                          <input type="number" step="0.0001" value={row.exchangeRate} onChange={(e) => updateRow(row.key, 'exchangeRate', e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                        </div>
                      )}
                      <div className={row.currency === 'TZS' ? 'md:col-span-2' : ''}>
                        <label className="block text-xs text-gray-500 mb-1">Amount ({row.currency})</label>
                        <input type="number" step="0.01" value={row.originalAmount} onChange={(e) => updateRow(row.key, 'originalAmount', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                      <div className={row.currency === 'TZS' ? 'md:col-span-2' : 'md:col-span-2'}>
                        {row.currency !== 'TZS' && (
                          <p className="text-xs text-gray-500 mb-1">≈ TZS {computeTzs(row).toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={() => removeRow(row.key)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="bg-gray-50 rounded-lg p-3 mb-6 flex justify-between items-center">
  <span className="text-sm font-medium text-gray-600">
    Total (TZS)
    {rows.some((r) => category === 'trip' && r.bookingTruckSelection === ALL_TRUCKS) && (
      <span className="block text-xs text-gray-400 font-normal">Includes lines applied to all trucks, multiplied per truck</span>
    )}
  </span>
  <span className="text-lg font-bold text-gray-800">TZS {total.toLocaleString()}</span>
</div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Expense' : 'Create Expense Order'}
      </button>
    </form>
  )
}

export default ExpenseForm