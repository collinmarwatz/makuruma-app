import type { UserRecord } from '../types/user'
import { apiClient } from './apiClient'

export interface UserFormData {
  name: string
  phone: string
  email: string
  role_id: string
  status: 'active' | 'suspended'
}

export async function fetchUsers(): Promise<UserRecord[]> {
  return apiClient('/users')
}

export async function createUser(data: UserFormData): Promise<UserRecord> {
  return apiClient('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateUser(id: number, data: Partial<UserFormData>): Promise<UserRecord> {
  return apiClient(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteUser(id: number): Promise<void> {
  return apiClient(`/users/${id}`, {
    method: 'DELETE',
  })
}

export async function resetUserPassword(id: number): Promise<{ message?: string }> {
  return apiClient(`/users/${id}/reset-password`, {
    method: 'POST',
  })
}