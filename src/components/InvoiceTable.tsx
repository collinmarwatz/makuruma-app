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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
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
        <tbody className="divide-y divide-gray-100">
          {invoices.map((inv) => {
            const typeLabel = INVOICE_TYPES.find((t) => t.value === inv.invoice_type)?.label ?? inv.invoice_type
            const truckRegNos = inv.lines.map((l) => l.booking_truck.truck.reg_no).join(', ')

            return (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-gray-600">{typeLabel}</td>
                <td className="px-4 py-3 text-gray-600">{inv.booking.booking_number}</td>
                <td className="px-4 py-3 text-gray-600">{inv.booking.client.company_name}</td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={truckRegNos}>{truckRegNos}</td>
                <td className="px-4 py-3 text-gray-600">{inv.invoice_date.slice(0, 10)}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">$ {parseFloat(inv.total_amount).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <Badge label={inv.status === 'paid' ? 'Paid' : 'Pending'} color={inv.status === 'paid' ? 'green' : 'yellow'} />
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.creator.name}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button onClick={() => onDownload(inv)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                      <Download size={16} />
                    </button>
                    {inv.status === 'pending' && (
                      <button onClick={() => onEdit(inv)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Pencil size={16} />
                      </button>
                    )}
                    {inv.status === 'pending' && canConfirmPayment && (
                      <button onClick={() => onMarkPaid(inv)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Confirm Payment">
                        <DollarSign size={16} />
                      </button>
                    )}
                    <button onClick={() => onDelete(inv)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
        <div className="text-center py-12 text-gray-400 text-sm">No invoices yet. Click "New Invoice" to get started.</div>
      )}
    </div>
  )
}

export default InvoiceTable