import { useEffect, useState } from 'react'
import type { Staff as StaffType } from '../types/employee'
import { fetchStaff, deleteStaff } from '../services/staffService'
import StaffForm from '../components/StaffForm'
import StaffTable from '../components/StaffTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Staff() {
  const [staff, setStaff] = useState<StaffType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffType | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) { setLoading(true); setError(null) }
      try {
        const data = await fetchStaff()
        if (!cancelled) setStaff(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load staff')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [reloadTrigger])

  function refresh() { setReloadTrigger((prev) => prev + 1) }
  function openAddModal() { setEditingStaff(null); setIsModalOpen(true) }
  function openEditModal(member: StaffType) { setEditingStaff(member); setIsModalOpen(true) }
  function handleSaved() { setIsModalOpen(false); refresh() }

  async function handleDelete(member: StaffType) {
    if (!window.confirm(`Delete ${member.full_name}? This can't be undone.`)) return
    try {
      await deleteStaff(member.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete staff member')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff</h1>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Staff
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={6} />
      ) : (
        <StaffTable staff={staff} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? `Edit Staff — ${editingStaff.full_name}` : 'Add Staff'}>
        <StaffForm staff={editingStaff} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Staff