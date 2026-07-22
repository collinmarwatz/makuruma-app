import { useEffect, useReducer, useState, type FormEvent } from 'react'
import { createInvoice, updateInvoice, fetchEligibleInvoiceTrucks, type InvoiceLineInput } from '../services/invoiceService'
import { fetchBookings } from '../services/bookingService'
import type { Booking } from '../types/booking'
import type { Invoice, InvoiceType, EligibleInvoiceTruck } from '../types/invoice'
import { INVOICE_TYPES } from '../constants/invoiceTypes'
import { Loader2 } from 'lucide-react'

interface InvoiceFormProps {
  invoice?: Invoice | null
  onSaved: () => void
}

interface LineState {
  quantity: string
  rate: string
  percentage: string
  isFlatAmount: boolean
  flatAmount: string
  days: string
}

interface TruckSelectionState {
  eligible: EligibleInvoiceTruck[]
  loading: boolean
  selectedIds: string[]
  lineData: Record<string, LineState>
}

type TruckAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: EligibleInvoiceTruck[] }
  | { type: 'FETCH_ERROR' }
  | { type: 'TOGGLE_TRUCK'; truckId: string; capacity: string | null; rate: string | null; invoiceType: InvoiceType }
  | { type: 'UPDATE_LINE'; truckId: string; field: keyof LineState; value: string | boolean }
  | { type: 'SET_INITIAL'; selectedIds: string[]; lineData: Record<string, LineState>; eligible: EligibleInvoiceTruck[] }

function truckReducer(state: TruckSelectionState, action: TruckAction): TruckSelectionState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, selectedIds: [], lineData: {} }
    case 'FETCH_SUCCESS':
      return { ...state, eligible: action.payload, loading: false }
    case 'FETCH_ERROR':
      return { ...state, eligible: [], loading: false }
    case 'SET_INITIAL':
      return { eligible: action.eligible, loading: false, selectedIds: action.selectedIds, lineData: action.lineData }
    case 'TOGGLE_TRUCK': {
      const isSelected = state.selectedIds.includes(action.truckId)
      const selectedIds = isSelected
        ? state.selectedIds.filter((id) => id !== action.truckId)
        : [...state.selectedIds, action.truckId]

      const lineData = { ...state.lineData }
      if (!isSelected && !lineData[action.truckId]) {
        lineData[action.truckId] = {
          quantity: action.invoiceType === 'advance' ? (action.capacity ?? '') : '',
          rate: action.rate ?? '',
          percentage: '100',
          isFlatAmount: false,
          flatAmount: '',
          days: '',
        }
      }

      return { ...state, selectedIds, lineData }
    }
    case 'UPDATE_LINE':
      return {
        ...state,
        lineData: { ...state.lineData, [action.truckId]: { ...state.lineData[action.truckId], [action.field]: action.value } },
      }
    default:
      return state
  }
}


function InvoiceForm({ invoice, onSaved }: InvoiceFormProps) {
  const isEditMode = !!invoice

  const [invoiceType, setInvoiceType] = useState<InvoiceType>(invoice?.invoice_type ?? 'advance')
  const [bookingId, setBookingId] = useState(invoice?.booking.id.toString() ?? '')
  const [invoiceDate, setInvoiceDate] = useState(invoice?.invoice_date.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  const [exchangeRate, setExchangeRate] = useState(invoice?.exchange_rate ?? '')

  const [dealNo, setDealNo] = useState(invoice?.deal_no ?? '')
  const [bivacNo, setBivacNo] = useState(invoice?.bivac_no ?? '')
  const [modeOfPayment, setModeOfPayment] = useState(invoice?.mode_of_payment ?? 'Bank')
  const [deliveryNoteNo, setDeliveryNoteNo] = useState(invoice?.delivery_note_no ?? '')
  const [deliveryNoteDate, setDeliveryNoteDate] = useState(invoice?.delivery_note_date?.slice(0, 10) ?? '')
  const [supplierRef, setSupplierRef] = useState(invoice?.supplier_ref ?? '')
  const [otherRef, setOtherRef] = useState(invoice?.other_ref ?? '')
  const [loadingConNo, setLoadingConNo] = useState(invoice?.loading_con_no ?? '')
  const [settlementNo, setSettlementNo] = useState(invoice?.settlement_no ?? '')
  const [dispatchedThrough, setDispatchedThrough] = useState(invoice?.dispatched_through ?? '')
  const [destination, setDestination] = useState(invoice?.destination ?? '')
  const [termsOfDelivery, setTermsOfDelivery] = useState(invoice?.terms_of_delivery ?? '')

  const [bookings, setBookings] = useState<Booking[]>([])
  const [truckState, dispatch] = useReducer(truckReducer, {
    eligible: [],
    loading: false,
    selectedIds: [],
    lineData: {},
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const typeConfig = INVOICE_TYPES.find((t) => t.value === invoiceType)!

  useEffect(() => {
    fetchBookings().then(setBookings).catch(() => setBookings([]))
  }, [])

  // Edit mode: seed truck selection directly from the invoice's own lines —
  // no need to fetch "eligible" trucks, since these are already committed.
  useEffect(() => {
    if (!isEditMode || !invoice) return

    const selectedIds: string[] = []
    const lineData: Record<string, LineState> = {}
    const eligible: EligibleInvoiceTruck[] = []

    invoice.lines.forEach((line) => {
      const btId = line.booking_truck.id.toString()
      selectedIds.push(btId)
      lineData[btId] = {
        quantity: line.quantity ?? '',
        rate: line.rate ?? '',
        percentage: '100',
        isFlatAmount: false,
        flatAmount: '',
        days: line.days?.toString() ?? '',
      }
      eligible.push({
        id: line.booking_truck.id,
        capacity: null,
        rate: null,
        truck: line.booking_truck.truck,
        trailer: line.booking_truck.trailer,
        trip: line.booking_truck.trip,
      })
    })

    dispatch({ type: 'SET_INITIAL', selectedIds, lineData, eligible })
  }, [isEditMode, invoice])

  // Create mode only: fetch eligible trucks whenever booking/type changes
  useEffect(() => {
    if (isEditMode) return
    if (!bookingId) return

    let cancelled = false
    dispatch({ type: 'FETCH_START' })

    fetchEligibleInvoiceTrucks(bookingId, invoiceType)
      .then((data) => {
        if (!cancelled) dispatch({ type: 'FETCH_SUCCESS', payload: data })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'FETCH_ERROR' })
      })

    return () => {
      cancelled = true
    }
  }, [bookingId, invoiceType, isEditMode])

  function toggleTruck(truckId: string, capacity: string | null, rate: string | null) {
    dispatch({ type: 'TOGGLE_TRUCK', truckId, capacity, rate, invoiceType })
  }

  function updateLine(truckId: string, field: keyof LineState, value: string | boolean) {
    dispatch({ type: 'UPDATE_LINE', truckId, field, value })
  }

  function computeAmount(truckId: string): number {
    const line = truckState.lineData[truckId]
    if (!line) return 0

    if (invoiceType === 'advance' && line.isFlatAmount) {
      return parseFloat(line.flatAmount) || 0
    }

    const quantity = parseFloat(line.quantity) || 0
    const rate = parseFloat(line.rate) || 0
    const days = parseFloat(line.days) || 0
    const percentage = invoiceType === 'advance' ? (parseFloat(line.percentage) || 100) / 100 : 1

    if (invoiceType === 'standing_time') return days * rate
    return quantity * rate * percentage
  }

  const total = truckState.selectedIds.reduce((sum, id) => sum + computeAmount(id), 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!bookingId) {
      setError('Select a booking')
      return
    }
    if (!exchangeRate) {
      setError('Enter the exchange rate for this invoice')
      return
    }
    if (truckState.selectedIds.length === 0) {
      setError('Select at least one truck')
      return
    }

    setIsSubmitting(true)

    const lines: InvoiceLineInput[] = truckState.selectedIds.map((id) => {
      const line = truckState.lineData[id]
      return {
        booking_truck_id: id,
        quantity: invoiceType === 'standing_time' ? '0' : line?.quantity || '0',
        rate: line?.rate || '0',
        percentage: invoiceType === 'advance' && !line?.isFlatAmount ? (line?.percentage || '100') : undefined,
        is_flat_amount: invoiceType === 'advance' ? !!line?.isFlatAmount : undefined,
        flat_amount: invoiceType === 'advance' && line?.isFlatAmount ? line?.flatAmount || '0' : undefined,
        days: invoiceType === 'standing_time' ? line?.days || '0' : undefined,
      }
    })

    const sharedPayload = {
      invoice_date: invoiceDate,
      exchange_rate: exchangeRate,
      deal_no: dealNo || undefined,
      bivac_no: bivacNo || undefined,
      mode_of_payment: modeOfPayment || undefined,
      delivery_note_no: deliveryNoteNo || undefined,
      delivery_note_date: deliveryNoteDate || undefined,
      supplier_ref: supplierRef || undefined,
      other_ref: otherRef || undefined,
      loading_con_no: loadingConNo || undefined,
      settlement_no: settlementNo || undefined,
      dispatched_through: dispatchedThrough || undefined,
      destination: destination || undefined,
      terms_of_delivery: termsOfDelivery || undefined,
      lines,
    }

    try {
      if (isEditMode && invoice) {
        await updateInvoice(invoice.id, sharedPayload)
      } else {
        await createInvoice({
          invoice_type: invoiceType,
          booking_id: bookingId,
          ...sharedPayload,
        })
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Invoice Type</label>
          <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)} disabled={isEditMode}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground disabled:opacity-60">
            {INVOICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Booking</label>
          <select value={bookingId} onChange={(e) => setBookingId(e.target.value)} disabled={isEditMode}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground disabled:opacity-60">
            <option value="">— Select —</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.booking_number} — {b.client.company_name}</option>
            ))}
            {isEditMode && invoice && (
              <option value={invoice.booking.id}>{invoice.booking.booking_number} — {invoice.booking.client.company_name}</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Invoice Date</label>
          <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Exchange Rate ($→TZS)</label>
          <input type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="e.g. 2690" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
      </div>

      <details className="mb-6">
        <summary className="text-sm font-medium text-muted-foreground cursor-pointer mb-2">Additional Reference Details</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <input type="text" value={dealNo} onChange={(e) => setDealNo(e.target.value)} placeholder="Deal No" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={bivacNo} onChange={(e) => setBivacNo(e.target.value)} placeholder="Bivac No" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={modeOfPayment} onChange={(e) => setModeOfPayment(e.target.value)} placeholder="Mode of Payment" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} placeholder="Supplier's Ref" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={otherRef} onChange={(e) => setOtherRef(e.target.value)} placeholder="Other Reference(s)" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={deliveryNoteNo} onChange={(e) => setDeliveryNoteNo(e.target.value)} placeholder="Delivery Note No" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="date" value={deliveryNoteDate} onChange={(e) => setDeliveryNoteDate(e.target.value)} placeholder="Delivery Note Date" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
          <input type="text" value={loadingConNo} onChange={(e) => setLoadingConNo(e.target.value)} placeholder="Loading Con No" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={settlementNo} onChange={(e) => setSettlementNo(e.target.value)} placeholder="Settlement No" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={dispatchedThrough} onChange={(e) => setDispatchedThrough(e.target.value)} placeholder="Dispatched Through" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <input type="text" value={termsOfDelivery} onChange={(e) => setTermsOfDelivery(e.target.value)} placeholder="Terms of Delivery" className="bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
        </div>
      </details>

      <h3 className="text-sm font-semibold text-foreground mb-2">
        {isEditMode ? 'Trucks on this Invoice' : `Select Truck(s) — not yet invoiced under ${typeConfig.label}`}
      </h3>

      {truckState.loading && <p className="text-sm text-muted-foreground mb-4">Loading eligible trucks...</p>}
      {!isEditMode && !truckState.loading && bookingId && truckState.eligible.length === 0 && (
        <p className="text-sm text-muted-foreground mb-4">All trucks in this booking already have a {typeConfig.label} invoice.</p>
      )}

      <div className="space-y-2 mb-6">
        {truckState.eligible.map((bt) => {
          const truckId = bt.id.toString()
          const checked = isEditMode || truckState.selectedIds.includes(truckId)
          const line = truckState.lineData[truckId]

          return (
            <div key={bt.id} className="ring-1 ring-border rounded-lg overflow-hidden">
              <label className={`flex items-center gap-3 px-3 py-2 text-sm ${isEditMode ? '' : 'cursor-pointer hover:bg-surface'}`}>
                <input type="checkbox" checked={checked} disabled={isEditMode}
                  onChange={() => toggleTruck(truckId, bt.capacity, bt.rate)} className={isEditMode ? '' : 'cursor-pointer'} />
                <span className="font-medium text-foreground">{bt.truck.reg_no}</span>
                <span className="text-muted-foreground text-xs">{bt.trailer?.reg_no ?? 'no trailer'} · {bt.trip?.trip_code ?? '—'}</span>
              </label>

              {checked && line && (
                <div className="bg-surface p-3 border-t border-hairline">
                  {invoiceType === 'advance' && (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground mb-2 cursor-pointer">
                      <input type="checkbox" checked={line.isFlatAmount}
                        onChange={(e) => updateLine(truckId, 'isFlatAmount', e.target.checked)} className="cursor-pointer" />
                      Enter a flat agreed amount instead of calculating
                    </label>
                  )}

                  {invoiceType === 'advance' && line.isFlatAmount ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">Flat Amount ($)</label>
                        <input type="number" step="0.01" value={line.flatAmount} onChange={(e) => updateLine(truckId, 'flatAmount', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                      <div className="md:col-span-2 flex items-end">
                        <div className="bg-brand/10 ring-1 ring-brand/20 rounded-lg px-3 py-2 text-sm w-full flex justify-between">
                          <span className="text-brand">Amount</span>
                          <span className="font-semibold text-brand">${computeAmount(truckId).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                      {invoiceType === 'standing_time' ? (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Days</label>
                          <input type="number" value={line.days} onChange={(e) => updateLine(truckId, 'days', e.target.value)}
                            className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">{typeConfig.quantityLabel}</label>
                          <input type="number" step="0.001" value={line.quantity} onChange={(e) => updateLine(truckId, 'quantity', e.target.value)}
                            className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs text-muted-foreground mb-1">{typeConfig.rateLabel}</label>
                        <input type="number" step="0.01" value={line.rate} onChange={(e) => updateLine(truckId, 'rate', e.target.value)}
                          className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                      </div>
                      {invoiceType === 'advance' && (
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Percentage (%)</label>
                          <input type="number" step="0.01" max="100" value={line.percentage} onChange={(e) => updateLine(truckId, 'percentage', e.target.value)}
                            className="w-full bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground" />
                        </div>
                      )}
                      <div className="flex items-end">
                        <div className="bg-brand/10 ring-1 ring-brand/20 rounded-lg px-3 py-2 text-sm w-full flex justify-between">
                          <span className="text-brand">Amount</span>
                          <span className="font-semibold text-brand">${computeAmount(truckId).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-surface rounded-lg p-3 mb-6 flex justify-between items-center ring-1 ring-white/5">
        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
        <span className="text-lg font-semibold text-foreground">$ {total.toLocaleString()}</span>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Invoice' : `Create ${typeConfig.label} Invoice`}
      </button>
    </form>
  )
}

export default InvoiceForm