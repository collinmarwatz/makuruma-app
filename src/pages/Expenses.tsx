import { useEffect, useMemo, useState } from 'react'
import type { ExpenseOrder, ExpenseCategory } from '../types/expense'
import {
  fetchExpenseOrders,
  deleteExpenseOrder,
  approveExpenseOrder,
  rejectExpenseOrder,
  markExpensePaid,
  downloadExpenseOrder,
} from '../services/expenseService'
import { useAuth } from '../hooks/useAuth'
import ExpenseForm from '../components/ExpenseForm'
import ExpenseTable from '../components/ExpenseTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Expenses() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState<ExpenseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<ExpenseOrder | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchExpenseOrders()
        if (!cancelled) setExpenses(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load expenses')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadTrigger])

  const filteredExpenses = useMemo(() => {
    if (categoryFilter === 'all') return expenses
    return expenses.filter((exp) => exp.category === categoryFilter)
  }, [expenses, categoryFilter])

  const categoryCounts = useMemo(() => {
    return {
      all: expenses.length,
      trip: expenses.filter((e) => e.category === 'trip').length,
      office: expenses.filter((e) => e.category === 'office').length,
      truck: expenses.filter((e) => e.category === 'truck').length,
    }
  }, [expenses])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
  }

  function openAddModal() {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  function openEditModal(expense: ExpenseOrder) {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(expense: ExpenseOrder) {
  const warning = expense.status !== 'pending'
    ? `${expense.order_number} has already been ${expense.status}. This will permanently delete it. Continue?`
    : `Delete expense order ${expense.order_number}?`

  if (!window.confirm(warning)) return
  try {
    await deleteExpenseOrder(expense.id)
    refresh()
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Failed to delete expense')
  }
}

  async function handleApprove(expense: ExpenseOrder) {
    try {
      await approveExpenseOrder(expense.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve')
    }
  }

  async function handleReject(expense: ExpenseOrder) {
    if (!window.confirm(`Reject expense order ${expense.order_number}?`)) return
    try {
      await rejectExpenseOrder(expense.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject')
    }
  }

  async function handleMarkPaid(expense: ExpenseOrder) {
    try {
      await markExpensePaid(expense.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as paid')
    }
  }

  async function handleDownload(expense: ExpenseOrder) {
    try {
      await downloadExpenseOrder(expense)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  const categoryTabs: { value: ExpenseCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'trip', label: 'Trip' },
    { value: 'office', label: 'Office' },
    { value: 'truck', label: 'Truck' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Expenses</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          New Expense
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        {categoryTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setCategoryFilter(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              categoryFilter === tab.value ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'
            }`}
          >
            {tab.label} ({categoryCounts[tab.value]})
          </button>
        ))}
      </div>

      {loading ? (
        <TableSkeleton columns={9} />
      ) : (
        <ExpenseTable
          expenses={filteredExpenses}
          userRoleSlug={user?.role?.slug ?? null}
          onEdit={openEditModal}
          onDelete={handleDelete}
          onApprove={handleApprove}
          onReject={handleReject}
          onMarkPaid={handleMarkPaid}
          onDownload={handleDownload}
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? `Edit Expense — ${editingExpense.order_number}` : 'New Expense Order'}
      >
        <ExpenseForm expense={editingExpense} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Expenses