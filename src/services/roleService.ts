import type { Role } from '../types/user'
import { apiClient } from './apiClient'

export async function fetchRoles(): Promise<Role[]> {
  return apiClient('/roles')
}