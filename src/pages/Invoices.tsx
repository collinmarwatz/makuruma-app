import { useEffect, useState } from 'react'
import type { Invoice } from '../types/invoice'
import { fetchInvoices, deleteInvoice, downloadInvoice } from '../services/invoiceService'
import InvoiceForm from '../components/InvoiceForm'
import InvoiceTable from '../components/InvoiceTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchInvoices()
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
  }, [reloadTrigger])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
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

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          New Invoice
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={9} />
      ) : (
        <InvoiceTable invoices={invoices} onDelete={handleDelete} onDownload={handleDownload} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Invoice">
        <InvoiceForm onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Invoices