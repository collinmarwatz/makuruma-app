import { useEffect, useState } from 'react'
import type { Invoice } from '../types/invoice'
import { fetchInvoices, deleteInvoice, downloadInvoice, markInvoicePaid } from '../services/invoiceService'
import { useAuth } from '../hooks/useAuth'
import InvoiceForm from '../components/InvoiceForm'
import InvoiceTable from '../components/InvoiceTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus, Search } from 'lucide-react'

function Invoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [bookingSearch, setBookingSearch] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchInvoices({ booking_number: bookingSearch || undefined })
        if (!cancelled) setInvoices(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load invoices')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadTrigger, bookingSearch])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
  }

  function openAddModal() {
    setEditingInvoice(null)
    setIsModalOpen(true)
  }

  function openEditModal(invoice: Invoice) {
    setEditingInvoice(invoice)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(invoice: Invoice) {
    if (!window.confirm(`Delete invoice ${invoice.invoice_number}?`)) return
    try {
      await deleteInvoice(invoice.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice')
    }
  }

  async function handleDownload(invoice: Invoice) {
    try {
      await downloadInvoice(invoice)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    }
  }

  async function handleMarkPaid(invoice: Invoice) {
    if (!window.confirm(`Confirm payment received for ${invoice.invoice_number}?`)) return
    try {
      await markInvoicePaid(invoice.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm payment')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={bookingSearch}
          onChange={(e) => setBookingSearch(e.target.value)}
          placeholder="Search by Booking Number..."
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <TableSkeleton columns={9} />
      ) : (
        <InvoiceTable
          invoices={invoices}
          userRoleSlug={user?.role?.slug ?? null}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onDownload={handleDownload}
          onMarkPaid={handleMarkPaid}
        />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingInvoice ? `Edit Invoice — ${editingInvoice.invoice_number}` : 'New Invoice'}>
        <InvoiceForm invoice={editingInvoice} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Invoices