import { useEffect, useReducer, useState, type FormEvent } from 'react'
import { createInvoice, fetchEligibleInvoiceTrucks, type InvoiceLineInput } from '../services/invoiceService'
import { fetchBookings } from '../services/bookingService'
import type { Booking } from '../types/booking'
import type { InvoiceType, EligibleInvoiceTruck } from '../types/invoice'
import { INVOICE_TYPES } from '../constants/invoiceTypes'
import { Loader2 } from 'lucide-react'

interface InvoiceFormProps {
  onSaved: () => void
}

interface LineState {
  quantity: string
  rate: string
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
  | { type: 'UPDATE_LINE'; truckId: string; field: keyof LineState; value: string }

function truckReducer(state: TruckSelectionState, action: TruckAction): TruckSelectionState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, selectedIds: [], lineData: {} }
    case 'FETCH_SUCCESS':
      return { ...state, eligible: action.payload, loading: false }
    case 'FETCH_ERROR':
      return { ...state, eligible: [], loading: false }
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

function InvoiceForm({ onSaved }: InvoiceFormProps) {
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('advance')
  const [bookingId, setBookingId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [exchangeRate, setExchangeRate] = useState('')

  const [dealNo, setDealNo] = useState('')
  const [bivacNo, setBivacNo] = useState('')
  const [modeOfPayment, setModeOfPayment] = useState('Bank')
  const [deliveryNoteNo, setDeliveryNoteNo] = useState('')
  const [deliveryNoteDate, setDeliveryNoteDate] = useState('')
  const [supplierRef, setSupplierRef] = useState('')
  const [otherRef, setOtherRef] = useState('')
  const [loadingConNo, setLoadingConNo] = useState('')
  const [settlementNo, setSettlementNo] = useState('')
  const [dispatchedThrough, setDispatchedThrough] = useState('')
  const [destination, setDestination] = useState('')
  const [termsOfDelivery, setTermsOfDelivery] = useState('')

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

  useEffect(() => {
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
  }, [bookingId, invoiceType])

  function toggleTruck(truckId: string, capacity: string | null, rate: string | null) {
    dispatch({ type: 'TOGGLE_TRUCK', truckId, capacity, rate, invoiceType })
  }

  function updateLine(truckId: string, field: keyof LineState, value: string) {
    dispatch({ type: 'UPDATE_LINE', truckId, field, value })
  }

  function computeAmount(truckId: string): number {
    const line = truckState.lineData[truckId]
    if (!line) return 0
    const quantity = parseFloat(line.quantity) || 0
    const rate = parseFloat(line.rate) || 0
    const days = parseFloat(line.days) || 0
    if (invoiceType === 'standing_time') return days * rate
    return quantity * rate
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

    const lines: InvoiceLineInput[] = truckState.selectedIds.map((id) => ({
      booking_truck_id: id,
      quantity: invoiceType === 'standing_time' ? '0' : truckState.lineData[id]?.quantity || '0',
      rate: truckState.lineData[id]?.rate || '0',
      days: invoiceType === 'standing_time' ? truckState.lineData[id]?.days || '0' : undefined,
    }))

    try {
      await createInvoice({
        invoice_type: invoiceType,
        booking_id: bookingId,
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
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create invoice')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Type</label>
          <select value={invoiceType} onChange={(e) => setInvoiceType(e.target.value as InvoiceType)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {INVOICE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Booking</label>
          <select value={bookingId} onChange={(e) => setBookingId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="">— Select —</option>
            {bookings.map((b) => (
              <option key={b.id} value={b.id}>{b.booking_number} — {b.client.company_name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
          <input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exchange Rate ($→TZS)</label>
          <input type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)}
            placeholder="e.g. 2690" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </div>

      <details className="mb-6">
        <summary className="text-sm font-medium text-gray-600 cursor-pointer mb-2">Additional Reference Details</summary>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          <input type="text" value={dealNo} onChange={(e) => setDealNo(e.target.value)} placeholder="Deal No" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={bivacNo} onChange={(e) => setBivacNo(e.target.value)} placeholder="Bivac No" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={modeOfPayment} onChange={(e) => setModeOfPayment(e.target.value)} placeholder="Mode of Payment" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={supplierRef} onChange={(e) => setSupplierRef(e.target.value)} placeholder="Supplier's Ref" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={otherRef} onChange={(e) => setOtherRef(e.target.value)} placeholder="Other Reference(s)" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={deliveryNoteNo} onChange={(e) => setDeliveryNoteNo(e.target.value)} placeholder="Delivery Note No" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="date" value={deliveryNoteDate} onChange={(e) => setDeliveryNoteDate(e.target.value)} placeholder="Delivery Note Date" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={loadingConNo} onChange={(e) => setLoadingConNo(e.target.value)} placeholder="Loading Con No" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={settlementNo} onChange={(e) => setSettlementNo(e.target.value)} placeholder="Settlement No" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={dispatchedThrough} onChange={(e) => setDispatchedThrough(e.target.value)} placeholder="Dispatched Through" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Destination" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
          <input type="text" value={termsOfDelivery} onChange={(e) => setTermsOfDelivery(e.target.value)} placeholder="Terms of Delivery" className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
      </details>

      <h3 className="text-sm font-bold text-gray-600 mb-2">
        Select Truck(s) — not yet invoiced under {typeConfig.label}
      </h3>

      {truckState.loading && <p className="text-sm text-gray-400 mb-4">Loading eligible trucks...</p>}
      {!truckState.loading && bookingId && truckState.eligible.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">All trucks in this booking already have a {typeConfig.label} invoice.</p>
      )}

      <div className="space-y-2 mb-6">
        {(bookingId ? truckState.eligible : []).map((bt) => {
          const truckId = bt.id.toString()
          const checked = truckState.selectedIds.includes(truckId)
          return (
            <div key={bt.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <label className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50">
                <input type="checkbox" checked={checked} onChange={() => toggleTruck(truckId, bt.capacity, bt.rate)} className="cursor-pointer" />
                <span className="font-medium text-gray-800">{bt.truck.reg_no}</span>
                <span className="text-gray-400 text-xs">{bt.trailer?.reg_no ?? 'no trailer'} · {bt.trip?.trip_code ?? '—'}</span>
              </label>

              {checked && (
                <div className="bg-gray-50 p-3 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {invoiceType === 'standing_time' ? (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Days</label>
                        <input type="number" value={truckState.lineData[truckId]?.days ?? ''} onChange={(e) => updateLine(truckId, 'days', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">{typeConfig.quantityLabel}</label>
                        <input type="number" step="0.001" value={truckState.lineData[truckId]?.quantity ?? ''} onChange={(e) => updateLine(truckId, 'quantity', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">{typeConfig.rateLabel}</label>
                      <input type="number" step="0.01" value={truckState.lineData[truckId]?.rate ?? ''} onChange={(e) => updateLine(truckId, 'rate', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                    </div>
                    <div className="flex items-end">
                      <div className="bg-blue-50 rounded-lg px-3 py-2 text-sm w-full flex justify-between">
                        <span className="text-blue-700">Amount</span>
                        <span className="font-bold text-blue-800">${computeAmount(truckId).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-6 flex justify-between items-center">
        <span className="text-sm font-medium text-gray-600">Total Amount</span>
        <span className="text-lg font-bold text-gray-800">$ {total.toLocaleString()}</span>
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Creating...' : `Create ${typeConfig.label} Invoice`}
      </button>
    </form>
  )
}

export default InvoiceForm