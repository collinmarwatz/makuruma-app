import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'

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
    <div className="min-h-screen bg-gradient-to-br from-white-700 to-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Makuruma Logistics" className="h-16" />
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-xl p-8"
        >
          <h1 className="text-xl font-bold text-gray-800 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">Sign in to manage your fleet</p>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4 border border-red-100">
              {error}
            </div>
          )}

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />

          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-teal-700 text-white py-2.5 rounded-lg font-medium hover:bg-teal-800 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Logging in...' : 'Log In'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login