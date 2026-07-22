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
  quantity: string
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
    quantity: '',
    truckLitres: {},
  }
}

function ExpenseForm({ expense, onSaved }: ExpenseFormProps) {
  const isEditMode = !!expense

  const [referenceNo, setReferenceNo] = useState(expense?.reference_no ?? '')
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
        quantity: first.quantity ?? '',
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

  const needsTruckSelection = category === 'trip'
  const usesQuantityRate = category === 'office'

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

    if (needsTruckSelection) {
      // Trip category — unchanged: fuel is per-truck litres, others are flat-per-truck × count
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

    if (usesQuantityRate) {
      // Office category — every line category uses Quantity × Rate
      const quantity = parseFloat(row.quantity) || 0
      const unitRate = parseFloat(row.unitRate) || 0
      return quantity * unitRate * rate
    }

    // Truck category — a single standalone flat amount, no quantity at all
    const amount = parseFloat(row.originalAmount) || 0
    return amount * rate
  }

  const total = rows.reduce((sum, r) => sum + computeRowTzsTotal(r), 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!referenceNo.trim()) {
      setError('Enter a unique expense reference number')
      return
    }
    if (category === 'trip' && !bookingId) {
      setError('Select a booking for a Trip category expense')
      return
    }
    if (category === 'truck' && !truckId) {
      setError('Select a truck for a Truck category expense')
      return
    }

    const validRows = rows.filter((r) => {
      if (!r.description.trim()) return false
      if (needsTruckSelection) return r.selectedTruckIds.length > 0
      return true
    })

    if (validRows.length === 0) {
      setError(
        needsTruckSelection
          ? 'Add at least one expense line with a description and at least one truck selected'
          : 'Add at least one expense line with a description'
      )
      return
    }

    setIsSubmitting(true)

    const lines: ExpenseLineInput[] = []

    validRows.forEach((r) => {
      const groupKey = crypto.randomUUID()
      const exchangeRate = r.currency === 'TZS' ? '1' : r.exchangeRate

      if (needsTruckSelection) {
        // Trip category — expand across every selected truck (unchanged)
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
        return
      }

      if (usesQuantityRate) {
        // Office category — quantity × rate, same for every line category
        lines.push({
          line_category: r.lineCategory,
          vendor_id: r.vendorId || undefined,
          group_key: groupKey,
          description: r.description,
          currency: r.currency,
          exchange_rate: exchangeRate,
          quantity: r.quantity || '0',
          unit_rate: r.unitRate || '0',
        })
        return
      }

      // Truck category — one flat standalone amount
      lines.push({
        line_category: r.lineCategory,
        vendor_id: r.vendorId || undefined,
        group_key: groupKey,
        description: r.description,
        currency: r.currency,
        exchange_rate: exchangeRate,
        original_amount: r.originalAmount || '0',
      })
    })

    try {
      if (isEditMode && expense) {
        await updateExpenseOrder(expense.id, {
          reference_no: referenceNo,
          payment_account: paymentAccount || undefined,
          initiated_by: initiatedBy || undefined,
          payment_date: paymentDate || undefined,
          lines,
        })
      } else {
        await createExpenseOrder({
          reference_no: referenceNo,
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
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">Expense Reference No.</label>
        <input type="text" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)}
          placeholder="e.g. 82" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
        <p className="text-xs text-muted-foreground mt-1">Must be unique across all expense orders.</p>
      </div>

      {!isEditMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground">
              <option value="trip">Trip</option>
              <option value="office">Office</option>
              <option value="truck">Truck</option>
            </select>
          </div>

          {category === 'trip' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Booking</label>
              <select value={bookingId} onChange={(e) => { setBookingId(e.target.value); setRows([newRow('fuel')]) }}
                className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="">— Select —</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.booking_number} ({b.direction.toUpperCase()}) — {b.client.company_name}</option>
                ))}
              </select>
            </div>
          )}

          {category === 'truck' && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Truck</label>
              <select value={truckId} onChange={(e) => setTruckId(e.target.value)}
                className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="">— Select —</option>
                {trucks.map((t) => <option key={t.id} value={t.id}>{t.reg_no}</option>)}
              </select>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Payment Account</label>
          <input type="text" value={paymentAccount} onChange={(e) => setPaymentAccount(e.target.value)}
            placeholder="e.g. CRDB - 0123456" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Initiated By</label>
          <input type="text" value={initiatedBy} onChange={(e) => setInitiatedBy(e.target.value)}
            placeholder="Name of person" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Payment Date</label>
          <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
        </div>
      </div>

      {category === 'trip' && bookingId && bookingTrucks.length === 0 && (
        <p className="text-xs text-warn bg-warn/10 rounded-lg p-2 mb-4 ring-1 ring-warn/20">This booking has no trucks assigned yet.</p>
      )}

      {LINE_CATEGORIES.filter((cat) => category === 'trip' || cat.value === 'mengine').map((cat) => {        const catRows = rows.filter((r) => r.lineCategory === cat.value)
        return (
          <div key={cat.value} className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{cat.label}</h3>
              <button type="button" onClick={() => addRow(cat.value)} className="flex items-center gap-1 text-xs text-brand font-medium hover:opacity-80">
                <Plus size={12} /> Add line
              </button>
            </div>

            {catRows.length === 0 ? (
              <p className="text-xs text-muted-foreground">No lines yet.</p>
            ) : (
              <div className="space-y-3">
                {catRows.map((row) => (
                  <div key={row.key} className="bg-surface rounded-lg p-3 ring-1 ring-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                      {cat.needsVendor && (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Vendor</label>
                          <select value={row.vendorId} onChange={(e) => updateRow(row.key, 'vendorId', e.target.value)}
                            className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground">
                            <option value="">— Select —</option>
                            {fuelVendors.map((v) => <option key={v.id} value={v.id}>{v.company_name}</option>)}
                          </select>
                        </div>
                      )}
                      <div className={cat.needsVendor ? '' : 'md:col-span-2'}>
                        <label className="block text-xs text-muted-foreground mb-1">Description</label>
                        <input type="text" value={row.description} onChange={(e) => updateRow(row.key, 'description', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Currency</label>
                        <select value={row.currency} onChange={(e) => updateRow(row.key, 'currency', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground">
                          {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                        </select>
                      </div>
                    </div>

                    {row.currency !== 'TZS' && (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-muted-foreground mb-1">Exchange Rate</label>
                        <input type="number" step="0.0001" value={row.exchangeRate} onChange={(e) => updateRow(row.key, 'exchangeRate', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                    )}

                    {/* Amount / rate section — differs by category */}
                    {needsTruckSelection && row.lineCategory === 'fuel' && (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-muted-foreground mb-1">Rate (per litre)</label>
                        <input type="number" step="0.01" value={row.unitRate} onChange={(e) => updateRow(row.key, 'unitRate', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                    )}
                    {needsTruckSelection && row.lineCategory !== 'fuel' && (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-muted-foreground mb-1">Amount (per truck)</label>
                        <input type="number" step="0.01" value={row.originalAmount} onChange={(e) => updateRow(row.key, 'originalAmount', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                    )}
                    {usesQuantityRate && (
                      <div className="grid grid-cols-2 gap-2 mb-2 w-80">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Quantity</label>
                          <input type="number" step="0.01" value={row.quantity} onChange={(e) => updateRow(row.key, 'quantity', e.target.value)}
                            className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Rate</label>
                          <input type="number" step="0.01" value={row.unitRate} onChange={(e) => updateRow(row.key, 'unitRate', e.target.value)}
                            className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                        </div>
                      </div>
                    )}
                    {!needsTruckSelection && !usesQuantityRate && (
                      <div className="mb-2 w-40">
                        <label className="block text-xs text-muted-foreground mb-1">Amount (TZS)</label>
                        <input type="number" step="0.01" value={row.originalAmount} onChange={(e) => updateRow(row.key, 'originalAmount', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                    )}

                    {needsTruckSelection && (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-muted-foreground">Applies To ({row.selectedTruckIds.length} selected)</label>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => selectAllTrucksForRow(row.key)} className="text-xs text-brand hover:opacity-80">Select All</button>
                            <button type="button" onClick={() => clearTrucksForRow(row.key)} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>
                          </div>
                        </div>
                        <div className="ring-1 ring-border rounded-lg divide-y divide-hairline max-h-36 overflow-y-auto bg-secondary">
                          {bookingTrucks.map((bt) => {
                            const btId = bt.id.toString()
                            const checked = row.selectedTruckIds.includes(btId)
                            return (
                              <div key={bt.id} className="px-2 py-1.5">
                                <label className="flex items-center gap-2 text-sm cursor-pointer">
                                  <input type="checkbox" checked={checked} onChange={() => toggleRowTruck(row.key, btId)} className="cursor-pointer" />
                                  <span className="font-medium text-foreground">{bt.truck.reg_no}</span>
                                </label>
                                {checked && row.lineCategory === 'fuel' && (
                                  <div className="ml-6 mt-1">
                                    <input type="number" step="0.01" value={row.truckLitres[btId] ?? ''}
                                      onChange={(e) => updateLitres(row.key, btId, e.target.value)}
                                      placeholder="Litres" className="w-32 bg-card ring-1 ring-border rounded-lg px-2 py-1 text-xs text-foreground" />
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        Line total: <span className="font-semibold text-foreground">TZS {computeRowTzsTotal(row).toLocaleString()}</span>
                      </p>
                      <button type="button" onClick={() => removeRow(row.key)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
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

      <div className="bg-surface-2 rounded-lg p-3 mb-6 flex justify-between items-center ring-1 ring-white/5">
        <span className="text-sm font-medium text-muted-foreground">Total (TZS)</span>
        <span className="text-lg font-bold text-foreground">TZS {total.toLocaleString()}</span>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Expense' : 'Create Expense Order'}
      </button>
    </form>
  )
}

export default ExpenseForm