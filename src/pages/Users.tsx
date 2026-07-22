import { useEffect, useState } from 'react'
import type { UserRecord } from '../types/user'
import { fetchUsers, deleteUser, resetUserPassword } from '../services/userService'
import { useAuth } from '../hooks/useAuth'
import UserForm from '../components/UserForm'
import UserTable from '../components/UserTable'
import Modal from '../components/ui/Modal'
import { Plus } from 'lucide-react'
import TableSkeleton from '../components/ui/TableSkeleton'

function Users() {
  const { user: currentUser } = useAuth()
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

  async function handleResetPassword(user: UserRecord) {
    const confirmed = window.confirm(`Reset this user's password to the default? They'll need to change it after logging in.`)
    if (!confirmed) return

    try {
      const result = await resetUserPassword(user.id)
      alert(result?.message || `Password reset for ${user.name}.`)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reset password')
    }
  }

  if (error) return <p className="p-8 text-destructive">Error: {error}</p>

  return (
  <div className="min-h-screen bg-background p-8">
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">Users</h1>
      <button
        onClick={openAddModal}
        className="flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
      >
        <Plus size={18} />
        Add User
      </button>
    </div>

    {loading ? (
      <TableSkeleton columns={6} />
    ) : (
      <UserTable
        users={users}
        currentUserRoleSlug={currentUser?.role?.slug ?? null}
        onEdit={openEditModal}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
      />
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