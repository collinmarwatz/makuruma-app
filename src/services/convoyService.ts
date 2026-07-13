import type { Convoy } from '../types/trip'
import { apiClient } from './apiClient'

export async function fetchConvoys(): Promise<Convoy[]> {
  return apiClient('/convoys')
}

export async function createConvoy(name: string): Promise<Convoy> {
  return apiClient('/convoys', { method: 'POST', body: JSON.stringify({ name }) })
}