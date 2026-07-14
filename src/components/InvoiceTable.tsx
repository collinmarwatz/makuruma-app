import type { Invoice } from '../types/invoice'
import { Download, Trash2 } from 'lucide-react'

interface InvoiceTableProps {
  invoices: Invoice[]
  onDelete: (invoice: Invoice) => void
  onDownload: (invoice: Invoice) => void
}

function InvoiceTable({ invoices, onDelete, onDownload }: InvoiceTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Invoice Number</th>
            <th className="px-4 py-3">Client</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Bookings</th>
            <th className="px-4 py-3">Trucks</th>
            <th className="px-4 py-3">Total</th>
            <th className="px-4 py-3">Created By</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {invoices.map((inv) => {
            const tripNumbers = Array.from(
              new Set(
                inv.lines
                  .map((l) => l.booking_truck?.trip_leg.trip.trip_number)
                  .filter((v): v is string => Boolean(v))
              )
            )
            const truckRegNos = inv.lines
              .map((l) => l.booking_truck?.truck.reg_no)
              .filter((v): v is string => Boolean(v))

            return (
              <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{inv.invoice_number}</td>
                <td className="px-4 py-3 text-gray-600">{inv.client.company_name}</td>
                <td className="px-4 py-3 text-gray-600">{inv.invoice_date}</td>
                <td className="px-4 py-3 text-gray-600">
                  {tripNumbers.length > 0 ? tripNumbers.join(', ') : '—'}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {truckRegNos.length > 0 ? truckRegNos.join(', ') : '—'}
                </td>
                <td className="px-4 py-3 text-gray-800 font-medium">
                  ${parseFloat(inv.total_amount).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{inv.creator.name}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onDownload(inv)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download invoice"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(inv)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete invoice"
                    >
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