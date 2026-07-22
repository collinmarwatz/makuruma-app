import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'
import bgLogin from '../assets/bg-login.png'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login({ email, password })
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4 bg-cover bg-center"
      style={{ backgroundImage: `url(${bgLogin})` }}
    >
      <div className="absolute inset-0 bg-linear-to-br from-background/90 via-background/80 to-brand/20" />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Makuruma Logistics" className="h-16" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-xl ring-1 ring-white/10 shadow-xl p-8"
        >
          <h1 className="text-xl font-semibold text-foreground mb-1">Welcome back</h1>
          <p className="text-sm text-muted-foreground mb-6">Sign in to manage your fleet</p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-foreground mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 mb-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />

          <label className="block text-sm font-medium text-foreground mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 mb-6 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login