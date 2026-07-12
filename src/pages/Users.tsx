import { useEffect, useState } from 'react'
import type { UserRecord } from '../types/user'
import { fetchUsers, deleteUser } from '../services/userService'
import UserForm from '../components/UserForm'
import UserTable from '../components/UserTable'
import Modal from '../components/ui/Modal'
import { Plus } from 'lucide-react'
import TableSkeleton from '../components/ui/TableSkeleton'

function Users() {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadUsers() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }

      try {
        const data = await fetchUsers()
        if (!cancelled) setUsers(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadUsers()

    return () => {
      cancelled = true
    }
  }, [reloadTrigger])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
  }

  function openAddModal() {
    setEditingUser(null)
    setIsModalOpen(true)
  }

  function openEditModal(user: UserRecord) {
    setEditingUser(user)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(user: UserRecord) {
    const confirmed = window.confirm(`Delete user ${user.name}? This can't be undone.`)
    if (!confirmed) return

    try {
      await deleteUser(user.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-bold text-gray-800">Users</h1>
      <button
        onClick={openAddModal}
        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        <Plus size={18} />
        Add User
      </button>
    </div>

    {loading ? (
      <TableSkeleton columns={6} />
    ) : (
      <UserTable users={users} onEdit={openEditModal} onDelete={handleDelete} />
    )}

    <Modal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title={editingUser ? `Edit User — ${editingUser.name}` : 'Add User'}
    >
      <UserForm user={editingUser} onSaved={handleSaved} />
    </Modal>
  </div>
)   
}

export default Users