import { apiClient } from './apiClient'

export interface UpdatePasswordData {
  current_password: string
  new_password: string
  new_password_confirmation: string
}

export async function updatePassword(data: UpdatePasswordData): Promise<{ message?: string }> {
  return apiClient('/profile/password', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
