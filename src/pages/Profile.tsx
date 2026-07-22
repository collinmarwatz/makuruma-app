import { useState, type FormEvent } from 'react'
import { updatePassword } from '../services/profileService'
import PasswordInput from '../components/ui/PasswordInput'
import { Loader2 } from 'lucide-react'

function Profile() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await updatePassword({
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      })
      setSuccess(result?.message || 'Password updated successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Profile</h1>
      <p className="text-sm text-muted-foreground mb-6">Update your account password.</p>

      <div className="bg-card rounded-xl ring-1 ring-white/5 p-6 max-w-md">
        <form onSubmit={handleSubmit}>
          {success && (
            <div className="bg-brand/10 text-brand text-sm rounded-lg p-3 mb-4 ring-1 ring-brand/20">
              {success}
            </div>
          )}
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">Current Password</label>
            <PasswordInput
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground mb-1">New Password</label>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-1">Confirm New Password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
