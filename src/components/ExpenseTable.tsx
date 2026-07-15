import type { ExpenseOrder } from '../types/expense'
import Badge from './ui/Badge'
import { Pencil, Trash2, Check, X, DollarSign, Download } from 'lucide-react'

interface ExpenseTableProps {
  expenses: ExpenseOrder[]
  userRoleSlug: string | null
  onEdit: (expense: ExpenseOrder) => void
  onDelete: (expense: ExpenseOrder) => void
  onApprove: (expense: ExpenseOrder) => void
  onReject: (expense: ExpenseOrder) => void
  onMarkPaid: (expense: ExpenseOrder) => void
  onDownload: (expense: ExpenseOrder) => void
}

const statusColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  pending: 'yellow',
  approved: 'gray',
  rejected: 'red',
  paid: 'green',
}

function ExpenseTable({ expenses, userRoleSlug, onEdit, onDelete, onApprove, onReject, onMarkPaid, onDownload }: ExpenseTableProps) {
  const canApprove = userRoleSlug === 'manager' || userRoleSlug === 'admin'
  const canPay = userRoleSlug === 'accountant' || userRoleSlug === 'admin'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Order Number</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Created By</th>
            <th className="px-4 py-3">Initiated By</th>
            <th className="px-4 py-3">Payment Date</th>
            <th className="px-4 py-3">Total (TZS)</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Approved By</th>
            <th className="px-4 py-3">Paid By</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{exp.order_number}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{exp.category}</td>
              <td className="px-4 py-3 text-gray-600">
                {exp.trip?.trip_number ?? exp.truck?.reg_no ?? '—'}
              </td>
              <td className="px-4 py-3 text-gray-600">{exp.creator.name}</td>
              <td className="px-4 py-3 text-gray-600">{exp.initiated_by ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{exp.payment_date ? exp.payment_date.slice(0, 10) : '—'}</td>
              <td className="px-4 py-3 text-gray-800 font-medium">
                TZS {parseFloat(exp.total_amount).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Badge label={exp.status} color={statusColors[exp.status]} />
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs">{exp.approver?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500 text-xs">{exp.payer?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => onDownload(exp)}
                    className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Download expense order"
                  >
                    <Download size={16} />
                  </button>
                  {exp.status === 'pending' && canApprove && (
                    <>
                      <button
                        onClick={() => onApprove(exp)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => onReject(exp)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {exp.status === 'approved' && canPay && (
                    <button
                      onClick={() => onMarkPaid(exp)}
                      className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Mark as Paid"
                    >
                      <DollarSign size={16} />
                    </button>
                  )}
                  {exp.status === 'pending' && (
                    <button
                      onClick={() => onEdit(exp)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(exp)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {expenses.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No expense orders yet. Click "New Expense" to get started.</div>
      )}
    </div>
  )
}

export default ExpenseTable