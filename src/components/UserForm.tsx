import { useState, useEffect, type FormEvent } from 'react'
import { createUser, updateUser } from '../services/userService'
import { fetchRoles } from '../services/roleService'
import type { UserRecord, Role } from '../types/user'
import { Loader2 } from 'lucide-react'
interface UserFormProps {
  user?: UserRecord | null
  onSaved: () => void
}

function UserForm({ user, onSaved }: UserFormProps) {
  const isEditMode = !!user

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [password, setPassword] = useState('')
  const [roleId, setRoleId] = useState(user?.role?.id?.toString() ?? '')
  const [status, setStatus] = useState<'active' | 'suspended'>(user?.status ?? 'active')

  const [roles, setRoles] = useState<Role[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRoles().then(setRoles).catch(() => setRoles([]))
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        name,
        phone,
        email,
        role_id: roleId,
        status,
        ...(password ? { password } : {}),
      }

      if (isEditMode) {
        await updateUser(user.id, payload)
      } else {
        await createUser({ ...payload, password })
      }

      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save user')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Password {isEditMode && <span className="text-muted-foreground font-normal">(leave blank to keep unchanged)</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required={!isEditMode}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Role</label>
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="">— Select role —</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <button
  type="submit"
  disabled={isSubmitting}
  className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
>
  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
  {isSubmitting ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
</button>
    </form>
  )
}

export default UserForm