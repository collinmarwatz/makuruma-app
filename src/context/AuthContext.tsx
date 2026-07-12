import { useState, useEffect, type ReactNode } from 'react'
import type { User, LoginCredentials } from '../types/auth'
import * as authService from '../services/authService'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function checkAuth() {
      const token = localStorage.getItem('auth_token')

      if (!token) {
        if (!cancelled) setIsLoading(false)
        return
      }

      try {
        const currentUser = await authService.getCurrentUser()
        if (!cancelled) setUser(currentUser)
      } catch {
        localStorage.removeItem('auth_token')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    checkAuth()

    return () => {
      cancelled = true
    }
  }, [])

  async function login(credentials: LoginCredentials) {
    const data = await authService.login(credentials)
    setUser(data.user)
  }

  async function logout() {
    await authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}