import { useEffect, useState } from 'react'
import type { Client } from '../types/partner'
import type { Vendor } from '../types/partner'
import type { ClientReconciliationSummary, VendorReconciliationSummary } from '../types/reconciliation'
import { fetchClients } from '../services/clientService'
import { fetchVendors } from '../services/vendorService'
import { fetchClientSummary, fetchVendorSummary, downloadClientStatement, downloadVendorLedger } from '../services/reconciliationService'
import VendorPaymentForm from '../components/VendorPaymentForm'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Download, Plus } from 'lucide-react'

type Tab = 'clients' | 'vendors'

function Reconciliation() {
  const [tab, setTab] = useState<Tab>('clients')

  const [clients, setClients] = useState<Client[]>([])
  const [clientSummaries, setClientSummaries] = useState<Record<number, ClientReconciliationSummary>>({})
  const [loadingClients, setLoadingClients] = useState(true)

  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorSummaries, setVendorSummaries] = useState<Record<number, VendorReconciliationSummary>>({})
  const [loadingVendors, setLoadingVendors] = useState(true)

  const [paymentModalVendorId, setPaymentModalVendorId] = useState<number | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function loadClients() {
      setLoadingClients(true)
      try {
        const data = await fetchClients()
        if (cancelled) return
        setClients(data)
        const summaries: Record<number, ClientReconciliationSummary> = {}
        await Promise.all(
          data.map(async (c) => {
            summaries[c.id] = await fetchClientSummary(c.id)
          })
        )
        if (!cancelled) setClientSummaries(summaries)
      } finally {
        if (!cancelled) setLoadingClients(false)
      }
    }

    loadClients()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadVendors() {
      setLoadingVendors(true)
      try {
        const data = await fetchVendors()
        if (cancelled) return
        setVendors(data)
        const summaries: Record<number, VendorReconciliationSummary> = {}
        await Promise.all(
          data.map(async (v) => {
            summaries[v.id] = await fetchVendorSummary(v.id)
          })
        )
        if (!cancelled) setVendorSummaries(summaries)
      } finally {
        if (!cancelled) setLoadingVendors(false)
      }
    }

    loadVendors()
    return () => { cancelled = true }
  }, [reloadTrigger])

  async function handleDownloadStatement(client: Client) {
    try {
      await downloadClientStatement(client.id, client.company_name)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    }
  }

  async function handleDownloadLedger(vendor: Vendor) {
    try {
      await downloadVendorLedger(vendor.id, vendor.company_name)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    }
  }

  function handlePaymentSaved() {
    setPaymentModalVendorId(null)
    setReloadTrigger((prev) => prev + 1)
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Reconciliation</h1>
      <p className="text-sm text-muted-foreground mb-6">Track outstanding revenue from clients and outstanding debt to vendors.</p>

      <div className="flex gap-2 mb-6 bg-surface-2 rounded-lg p-1 w-fit ring-1 ring-white/5">
        <button
          onClick={() => setTab('clients')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'clients' ? 'bg-card text-brand shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Client Revenue
        </button>
        <button
          onClick={() => setTab('vendors')}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
            tab === 'vendors' ? 'bg-card text-brand shadow-sm' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Vendor Expenses
        </button>
      </div>

      {tab === 'clients' && (
        loadingClients ? (
          <TableSkeleton columns={6} />
        ) : (
          <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">Invoices</th>
                  <th className="px-4 py-3">Total Invoiced ($)</th>
                  <th className="px-4 py-3">Total Paid ($)</th>
                  <th className="px-4 py-3">Outstanding ($)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {clients.map((client) => {
                  const summary = clientSummaries[client.id]
                  return (
                    <tr key={client.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{client.company_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{summary?.invoice_count ?? 0}</td>
                      <td className="px-4 py-3 text-muted-foreground">{summary?.total_invoiced.toLocaleString() ?? '0'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{summary?.total_paid.toLocaleString() ?? '0'}</td>
                      <td className={`px-4 py-3 font-medium ${summary && summary.outstanding > 0 ? 'text-destructive' : 'text-brand'}`}>
                        {summary?.outstanding.toLocaleString() ?? '0'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleDownloadStatement(client)}
                            className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            title="Download statement"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {clients.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No clients yet.</div>}
          </div>
        )
      )}

      {tab === 'vendors' && (
        loadingVendors ? (
          <TableSkeleton columns={5} />
        ) : (
          <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-4 py-3">Vendor</th>
                  <th className="px-4 py-3">Total Debt (TZS)</th>
                  <th className="px-4 py-3">Total Paid (TZS)</th>
                  <th className="px-4 py-3">Balance (TZS)</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {vendors.map((vendor) => {
                  const summary = vendorSummaries[vendor.id]
                  return (
                    <tr key={vendor.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{vendor.company_name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{summary?.total_debt.toLocaleString() ?? '0'}</td>
                      <td className="px-4 py-3 text-muted-foreground">{summary?.total_paid.toLocaleString() ?? '0'}</td>
                      <td className={`px-4 py-3 font-medium ${summary && summary.balance > 0 ? 'text-destructive' : 'text-brand'}`}>
                        {summary?.balance.toLocaleString() ?? '0'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => setPaymentModalVendorId(vendor.id)}
                            className="flex items-center gap-1 text-xs bg-secondary text-secondary-foreground px-2.5 py-1.5 rounded-lg ring-1 ring-border hover:bg-surface transition-colors"
                          >
                            <Plus size={12} /> Record Payment
                          </button>
                          <button
                            onClick={() => handleDownloadLedger(vendor)}
                            className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                            title="Download ledger"
                          >
                            <Download size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {vendors.length === 0 && <div className="text-center py-12 text-muted-foreground text-sm">No vendors yet.</div>}
          </div>
        )
      )}

      <Modal isOpen={paymentModalVendorId !== null} onClose={() => setPaymentModalVendorId(null)} title="Record Vendor Payment">
        {paymentModalVendorId !== null && (
          <VendorPaymentForm vendorId={paymentModalVendorId} onSaved={handlePaymentSaved} />
        )}
      </Modal>
    </div>
  )
}

export default Reconciliation