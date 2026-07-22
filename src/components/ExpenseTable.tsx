import type { ExpenseOrder } from '../types/expense'
import { LINE_CATEGORIES } from '../constants/expenseLineCategories'
import Badge from './ui/Badge'
import { Pencil, Trash2, Check, X, DollarSign, Download, FileSpreadsheet } from 'lucide-react'

interface ExpenseTableProps {
  expenses: ExpenseOrder[]
  userRoleSlug: string | null
  onEdit: (expense: ExpenseOrder) => void
  onDelete: (expense: ExpenseOrder) => void
  onApprove: (expense: ExpenseOrder) => void
  onReject: (expense: ExpenseOrder) => void
  onMarkPaid: (expense: ExpenseOrder) => void
  onDownload: (expense: ExpenseOrder) => void
  onDownloadExcel: (expense: ExpenseOrder) => void
  onDownloadCategory: (expense: ExpenseOrder, category: string) => void
}

const statusColors: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  pending: 'yellow',
  approved: 'gray',
  rejected: 'red',
  paid: 'green',
}

function categoriesPresent(exp: ExpenseOrder): string[] {
  return Array.from(new Set(exp.lines.map((l) => l.line_category)))
}

function ExpenseTable({
  expenses,
  userRoleSlug,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  onMarkPaid,
  onDownload,
  onDownloadExcel,
  onDownloadCategory,
}: ExpenseTableProps) {
  const canApprove = userRoleSlug === 'manager' || userRoleSlug === 'admin'
  const canPay = userRoleSlug === 'accountant' || userRoleSlug === 'admin'

  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Order Number</th>
            <th className="px-4 py-3">Reference No.</th>
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
        <tbody className="divide-y divide-hairline">
          {expenses.map((exp) => (
            <tr key={exp.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{exp.order_number}</td>
              <td className="px-4 py-3 text-muted-foreground">{exp.reference_no ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground capitalize">{exp.category}</td>
              <td className="px-4 py-3 text-muted-foreground">
                {exp.booking?.booking_number ?? exp.truck?.reg_no ?? '—'}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{exp.creator.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{exp.initiated_by ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{exp.payment_date ? exp.payment_date.slice(0, 10) : '—'}</td>
              <td className="px-4 py-3 text-foreground font-medium">
                TZS {parseFloat(exp.total_amount).toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <Badge label={exp.status} color={statusColors[exp.status]} />
              </td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{exp.approver?.name ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground text-xs">{exp.payer?.name ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => onDownload(exp)}
                    className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                    title="Download PDF"
                  >
                    <Download size={16} />
                  </button>
                  <button
                    onClick={() => onDownloadExcel(exp)}
                    className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                    title="Download Excel (all lines)"
                  >
                    <FileSpreadsheet size={16} />
                  </button>
                  {categoriesPresent(exp).map((cat) => {
                    const label = LINE_CATEGORIES.find((c) => c.value === cat)?.label ?? cat
                    return (
                      <button
                        key={cat}
                        onClick={() => onDownloadCategory(exp, cat)}
                        className="p-1.5 text-muted-foreground hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        title={`Download ${label} export`}
                      >
                        <FileSpreadsheet size={16} />
                      </button>
                    )
                  })}
                  {exp.status === 'pending' && canApprove && (
                    <>
                      <button
                        onClick={() => onApprove(exp)}
                        className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={() => onReject(exp)}
                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X size={16} />
                      </button>
                    </>
                  )}
                  {exp.status === 'approved' && canPay && (
                    <button
                      onClick={() => onMarkPaid(exp)}
                      className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                      title="Mark as Paid"
                    >
                      <DollarSign size={16} />
                    </button>
                  )}
                  {exp.status === 'pending' && (
                    <button
                      onClick={() => onEdit(exp)}
                      className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(exp)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
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
        <div className="text-center py-12 text-muted-foreground text-sm">No expense orders yet. Click "New Expense" to get started.</div>
      )}
    </div>
  )
}

export default ExpenseTable