import { useEffect, useState, type FormEvent } from 'react'
import {
  createExpenseOrder,
  updateExpenseOrder,
  type ExpenseLineInput,
} from '../services/expenseService'
import { fetchBookings } from '../services/bookingService'
import { fetchTrucks } from '../services/truckService'
import { fetchVendors } from '../services/vendorService'
import type { ExpenseOrder, ExpenseCategory, LineCategory, Currency } from '../types/expense'
import type { Booking } from '../types/booking'
import type { Truck } from '../types/truck'
import type { Vendor } from '../types/partner'
import { LINE_CATEGORIES, CURRENCIES } from '../constants/expenseLineCategories'
import { Loader2, Plus, Trash2 } from 'lucide-react'

interface ExpenseFormProps {
  expense?: ExpenseOrder | null
  onSaved: () => void
}

interface LineRow {
  key: string
  lineCategory: LineCategory
  vendorId: string
  selectedTruckIds: string[]
  description: string
  currency: Currency
  exchangeRate: string
  originalAmount: string
  unitRate: string
  truckLitres: Record<string, string>
}

function newRow(category: LineCategory): LineRow {
  return {
    key: Math.random().toString(36).slice(2),
    lineCategory: category,
    vendorId: '',
    selectedTruckIds: [],
    description: '',
    currency: 'TZS',
    exchangeRate: '1',
    originalAmount: '',
    unitRate: '',
    truckLitres: {},
  }
}

function ExpenseForm({ expense, onSaved }: ExpenseFormProps) {
  const isEditMode = !!expense

  const [category, setCategory] = useState<ExpenseCategory>(expense?.category ?? 'trip')
  const [bookingId, setBookingId] = useState(expense?.booking?.id.toString() ?? '')
  const [truckId, setTruckId] = useState(expense?.truck?.id.toString() ?? '')

  const [paymentAccount, setPaymentAccount] = useState(expense?.payment_account ?? '')
  const [initiatedBy, setInitiatedBy] = useState(expense?.initiated_by ?? '')
  const [paymentDate, setPaymentDate] = useState(expense?.payment_date?.slice(0, 10) ?? '')

  const [rows, setRows] = useState<LineRow[]>(() => {
    if (!expense) return [newRow('fuel')]

    const groups = new Map<string, typeof expense.lines>()
    let ungroupedIndex = 0
    expense.lines.forEach((line) => {
      const key = line.group_key ?? `__single_${ungroupedIndex++}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(line)
    })

    return Array.from(groups.values()).map((group) => {
      const first = group[0]
      const truckLitres: Record<string, string> = {}
      group.forEach((l) => {
        if (l.booking_truck) truckLitres[l.booking_truck.id.toString()] = l.quantity ?? ''
      })

      return {
        key: Math.random().toString(36).slice(2),
        lineCategory: first.line_category,
        vendorId: first.vendor?.id.toString() ?? '',
        selectedTruckIds: group.map((l) => l.booking_truck?.id.toString() ?? '').filter(Boolean),
        description: first.description,
        currency: first.currency,
        exchangeRate: first.exchange_rate,
        originalAmount: first.original_amount,
        unitRate: first.unit_rate ?? '',
        truckLitres,
      }
    })
  })

  const [bookings, setBookings] = useState<Booking[]>([])
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings().then(setBookings).catch(() => setBookings([]))
    fetchTrucks().then(setTrucks).catch(() => setTrucks([]))
    fetchVendors().then(setVendors).catch(() => setVendors([]))
  }, [])

  const fuelVendors = vendors.filter((v) => v.vendor_type === 'fuel')
  const selectedBooking = bookings.find((b) => b.id.toString() === bookingId)
  const bookingTrucks = selectedBooking?.booking_trucks ?? []

  function addRow(cat: LineCategory) {
    setRows((prev) => [...prev, newRow(cat)])
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key))
  }

  function updateRow(key: string, field: keyof LineRow, value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)))
  }

  function toggleRowTruck(rowKey: string, truckId: string) {
    setRows((prev) =>
      prev.map((r) => {
        if (r.key !== rowKey) return r
        const selected = r.selectedTruckIds.includes(truckId)
        return {
          ...r,
          selectedTruckIds: selected
            ? r.selectedTruckIds.filter((id) => id !== truckId)
            : [...r.selectedTruckIds, truckId],
        }
      })
    )
  }

  function selectAllTrucksForRow(rowKey: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.key === rowKey ? { ...r, selectedTruckIds: bookingTrucks.map((bt) => bt.id.toString()) } : r
      )
    )
  }

  function clearTrucksForRow(rowKey: string) {
    setRows((prev) => (prev.map((r) => (r.key === rowKey ? { ...r, selectedTruckIds: [] } : r))))
  }

  function updateLitres(rowKey: string, truckId: string, value: string) {
    setRows((prev) =>
      prev.map((r) =>
        r.key === rowKey ? { ...r, truckLitres: { ...r.truckLitres, [truckId]: value } } : r
      )
    )
  }

  function computeRowTzsTotal(row: LineRow): number {
    const rate = row.currency === 'TZS' ? 1 : (parseFloat(row.exchangeRate) || 0)

    if (row.lineCategory === 'fuel') {
      const unitRate = parseFloat(row.unitRate) || 0
      const totalLitres = row.selectedTruckIds.reduce(
        (sum, id) => sum + (parseFloat(row.truckLitres[id] ?? '0') || 0),
        0
      )
      return totalLitres * unitRate * rate
    }

    const amount = parseFloat(row.originalAmount) || 0
    return amount * row.selectedTruckIds.length * rate
  }

  const total = rows.reduce((sum, r) => sum + computeRowTzsTotal(r), 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (category === 'trip' && !bookingId) {
      setError('Select a booking for a Trip category expense')
      return
    }
    if (category === 'truck' && !truckId) {
      setError('Select a truck for a Truck category expense')
      return
    }

    const validRows = rows.filter((r) => r.description.trim() && r.selectedTruckIds.length > 0)
    if (validRows.length === 0) {
      setError('Add at least one expense line with a description and at least one truck selected')
      return
    }

    setIsSubmitting(true)

    const lines: ExpenseLineInput[] = []

validRows.forEach((r) => {
  const groupKey = crypto.randomUUID()
  const exchangeRate = r.currency === 'TZS' ? '1' : r.exchangeRate

  r.selectedTruckIds.forEach((truckId) => {
    if (r.lineCategory === 'fuel') {
      lines.push({
        line_category: r.lineCategory,
        vendor_id: r.vendorId || undefined,
        booking_truck_id: truckId,
        group_key: groupKey,
        description: r.description,
        currency: r.currency,
        exchange_rate: exchangeRate,
        quantity: r.truckLitres[truckId] || '0',
        unit_rate: r.unitRate || '0',
      })
    } else {
      lines.push({
        line_category: r.lineCategory,
        booking_truck_id: truckId,
        group_key: groupKey,
        description: r.description,
        currency: r.currency,
        exchange_rate: exchangeRate,
        original_amount: r.originalAmount || '0',
      })
    }
  })
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
          booking_id: category === 'trip' ? bookingId : undefined,
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
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>}

      {!isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
              <option value="trip">Convoy</option>
              <option value="office">Office</option>
              <option value="truck">Truck Annual Cost</option>
            </select>
          </div>

          {category === 'trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Booking</label>
              <select value={bookingId} onChange={(e) => { setBookingId(e.target.value); setRows([newRow('fuel')]) }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="">— Select —</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.booking_number} ({b.direction.toUpperCase()}) — {b.client.company_name}</option>
                ))}
              </select>
            </div>
          )}

          {category === 'truck' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Truck</label>
              <select value={truckId} onChange={(e) => setTruckId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
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

      {category === 'trip' && bookingId && bookingTrucks.length === 0 && (
        <p className="text-xs text-yellow-600 bg-yellow-50 rounded-lg p-2 mb-4">This booking has no trucks assigned yet.</p>
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
              <div className="space-y-3">
                {catRows.map((row) => (
                  <div key={row.key} className="bg-gray-50 rounded-lg p-3">
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
                      <div className={cat.needsVendor ? '' : 'md:col-span-2'}>
                        <label className="block text-xs text-gray-500 mb-1">Description</label>
                        <input type="text" value={row.description} onChange={(e) => updateRow(row.key, 'description', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Currency</label>
                        <select value={row.currency} onChange={(e) => updateRow(row.key, 'currency', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
                          {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {row.currency !== 'TZS' && (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-gray-500 mb-1">Exchange Rate</label>
                        <input type="number" step="0.0001" value={row.exchangeRate} onChange={(e) => updateRow(row.key, 'exchangeRate', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                    )}

                    {row.lineCategory === 'fuel' ? (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-gray-500 mb-1">Rate (per litre)</label>
                        <input type="number" step="0.01" value={row.unitRate} onChange={(e) => updateRow(row.key, 'unitRate', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                    ) : (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-gray-500 mb-1">Amount (per truck)</label>
                        <input type="number" step="0.01" value={row.originalAmount} onChange={(e) => updateRow(row.key, 'originalAmount', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-gray-500">Applies To ({row.selectedTruckIds.length} selected)</label>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => selectAllTrucksForRow(row.key)} className="text-xs text-blue-600 hover:text-blue-700">Select All</button>
                        <button type="button" onClick={() => clearTrucksForRow(row.key)} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                      </div>
                    </div>
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-36 overflow-y-auto bg-white">
                      {bookingTrucks.map((bt) => {
                        const btId = bt.id.toString()
                        const checked = row.selectedTruckIds.includes(btId)
                        return (
                          <div key={bt.id} className="px-2 py-1.5">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                              <input type="checkbox" checked={checked} onChange={() => toggleRowTruck(row.key, btId)} className="cursor-pointer" />
                              <span className="font-medium text-gray-800">{bt.truck.reg_no}</span>
                            </label>
                            {checked && row.lineCategory === 'fuel' && (
                              <div className="ml-6 mt-1">
                                <input type="number" step="0.01" value={row.truckLitres[btId] ?? ''}
                                  onChange={(e) => updateLitres(row.key, btId, e.target.value)}
                                  placeholder="Litres" className="w-32 border border-gray-300 rounded-lg px-2 py-1 text-xs" />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="mt-2 text-right text-xs text-gray-500">
                      Line total: <span className="font-semibold text-gray-700">TZS {computeRowTzsTotal(row).toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end mt-1">
                      <button type="button" onClick={() => removeRow(row.key)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="bg-gray-50 rounded-lg p-3 mb-6 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Total (TZS)</span>
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