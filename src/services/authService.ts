import type { AuthResponse, LoginCredentials, User } from '../types/auth'
import { apiClient } from './apiClient'

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const data: AuthResponse = await apiClient('/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  localStorage.setItem('auth_token', data.token)
  return data
}

export async function logout(): Promise<void> {
  await apiClient('/logout', { method: 'POST' })
  localStorage.removeItem('auth_token')
}

export async function getCurrentUser(): Promise<User> {
  return apiClient('/me')
}