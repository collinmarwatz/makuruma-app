import { useEffect, useState, type FormEvent } from 'react'
import { createInvoice, fetchInvoiceableLegs } from '../services/invoiceService'
import { fetchClients } from '../services/clientService'
import type { Client } from '../types/partner'
import type { InvoiceableLeg } from '../types/invoice'
import { Loader2 } from 'lucide-react'

interface InvoiceFormProps {
  onSaved: () => void
}

function InvoiceForm({ onSaved }: InvoiceFormProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().slice(0, 10))
  const [modeOfPayment, setModeOfPayment] = useState('')

  const [legs, setLegs] = useState<InvoiceableLeg[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [isLoadingLegs, setIsLoadingLegs] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients().then(setClients).catch(() => setClients([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadLegs() {
      if (!clientId) {
        if (!cancelled) {
          setLegs([])
          setSelectedIds([])
        }
        return
      }

      if (!cancelled) {
        setIsLoadingLegs(true)
        setSelectedIds([])
      }

      try {
        const data = await fetchInvoiceableLegs(clientId)
        if (!cancelled) setLegs(data)
      } catch {
        if (!cancelled) setLegs([])
      } finally {
        if (!cancelled) setIsLoadingLegs(false)
      }
    }

    loadLegs()

    return () => {
      cancelled = true
    }
  }, [clientId])

  function toggleLeg(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    )
  }

  const total = legs
    .filter((leg) => selectedIds.includes(leg.id.toString()))
    .reduce((sum, leg) => sum + (parseFloat(leg.amount ?? '0') || 0), 0)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!clientId) {
      setError('Select a client')
      return
    }
    if (selectedIds.length === 0) {
      setError('Select at least one truck booking to invoice')
      return
    }

    setIsSubmitting(true)
    try {
      await createInvoice({
        client_id: clientId,
        invoice_date: invoiceDate,
        mode_of_payment: modeOfPayment || undefined,
        booking_truck_ids: selectedIds,
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
      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">— Select —</option>
            {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
          <input
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mode of Payment</label>
          <input
            type="text"
            value={modeOfPayment}
            onChange={(e) => setModeOfPayment(e.target.value)}
            placeholder="e.g. Bank Transfer"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      {clientId && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Truck Bookings to Invoice
          </label>

          {isLoadingLegs ? (
            <p className="text-sm text-gray-400">Loading bookings...</p>
          ) : legs.length === 0 ? (
            <p className="text-sm text-gray-400">No un-invoiced truck bookings found for this client.</p>
          ) : (
            <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-56 overflow-y-auto">
              {legs.map((leg) => (
                <label
                  key={leg.id}
                  className="flex items-center justify-between gap-3 px-3 py-2.5 text-sm cursor-pointer hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(leg.id.toString())}
                      onChange={() => toggleLeg(leg.id.toString())}
                      className="cursor-pointer"
                    />
                    <div>
                      <span className="font-medium text-gray-800">{leg.trip_leg.trip.trip_number}</span>
                      <span className="text-gray-400 text-xs ml-2">
                        ({leg.trip_leg.direction.toUpperCase()}) · {leg.truck.reg_no}
                      </span>
                      <p className="text-xs text-gray-500">{leg.trip_leg.description ?? 'No description'}</p>
                    </div>
                  </div>
                  <span className="text-gray-600 font-medium">
                    {leg.amount ? `$${parseFloat(leg.amount).toLocaleString()}` : '—'}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-6 flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">
            Total ({selectedIds.length} booking{selectedIds.length > 1 ? 's' : ''})
          </span>
          <span className="text-lg font-bold text-gray-800">${total.toLocaleString()}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Creating...' : 'Create Invoice'}
      </button>
    </form>
  )
}

export default InvoiceForm