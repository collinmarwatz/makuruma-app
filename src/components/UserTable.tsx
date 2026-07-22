import type { UserRecord } from '../types/user'
import Badge from './ui/Badge'
import { Pencil, Trash2, KeyRound } from 'lucide-react'

interface UserTableProps {
  users: UserRecord[]
  currentUserRoleSlug: string | null
  onEdit: (user: UserRecord) => void
  onDelete: (user: UserRecord) => void
  onResetPassword: (user: UserRecord) => void
}

function UserTable({ users, currentUserRoleSlug, onEdit, onDelete, onResetPassword }: UserTableProps) {
  const canResetPassword = currentUserRoleSlug === 'admin'

  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Phone Number</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.phone ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
              <td className="px-4 py-3">
                <Badge label={user.role?.name ?? 'No role'} color={user.role ? 'gray' : 'yellow'} />
              </td>
              <td className="px-4 py-3">
                <Badge label={user.status} color={user.status === 'active' ? 'green' : 'red'} />
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {canResetPassword && (
                    <button
                      onClick={() => onResetPassword(user)}
                      className="p-1.5 text-muted-foreground hover:text-warn hover:bg-warn/10 rounded-lg transition-colors"
                      title="Reset password to default"
                    >
                      <KeyRound size={16} />
                    </button>
                  )}
                  <button
                    onClick={() => onEdit(user)}
                    className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors"
                    title="Edit user"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(user)}
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    title="Delete user"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {users.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No users added yet. Click "Add User" to get started.
        </div>
      )}
    </div>
  )
}

export default UserTable