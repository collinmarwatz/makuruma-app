import type { Invoice } from '../types/invoice'
import { INVOICE_TYPES } from '../constants/invoiceTypes'
import Badge from './ui/Badge'
import { Download, Trash2, Pencil, DollarSign } from 'lucide-react'

interface InvoiceTableProps {
  invoices: Invoice[]
  userRoleSlug: string | null
  onEdit: (invoice: Invoice) => void
  onDelete: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
  onMarkPaid: (invoice: Invoice) => void
}

function InvoiceTable({ invoices, userRoleSlug, onEdit, onDelete, onDownload, onMarkPaid }: InvoiceTableProps) {
  const canConfirmPayment = userRoleSlug === 'accountant' || userRoleSlug === 'admin'

  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Invoice No.</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Booking</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Trucks</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Created By</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {invoices.map((inv) => {
            const typeLabel = INVOICE_TYPES.find((t) => t.value === inv.invoice_type)?.label ?? inv.invoice_type
            const truckRegNos = inv.lines.map((l) => l.booking_truck.truck.reg_no).join(', ')

            return (
              <tr key={inv.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{typeLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.booking.booking_number}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.booking.client.company_name}</td>
                <td className="px-4 py-3 text-muted-foreground max-w-xs truncate" title={truckRegNos}>{truckRegNos}</td>
                <td className="px-4 py-3 text-muted-foreground">{inv.invoice_date.slice(0, 10)}</td>
                <td className="px-4 py-3 text-foreground font-medium">$ {parseFloat(inv.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge label={inv.status === 'paid' ? 'Paid' : 'Pending'} color={inv.status === 'paid' ? 'green' : 'yellow'} />
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{inv.creator.name}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => onDownload(inv)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Download">
                      <Download size={16} />
                    </button>
                    {inv.status === 'pending' && (
                      <button onClick={() => onEdit(inv)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                    )}
                    {inv.status === 'pending' && canConfirmPayment && (
                      <button onClick={() => onMarkPaid(inv)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Confirm Payment">
                        <DollarSign size={16} />
                      </button>
                    )}
                    <button onClick={() => onDelete(inv)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {invoices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No invoices yet. Click "New Invoice" to get started.</div>
      )}
    </div>
  )
}

export default InvoiceTable