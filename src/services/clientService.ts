import type { Client } from '../types/partner'
import { apiClient } from './apiClient'

export interface ClientFormData {
  company_name: string
  email: string
  phone: string
}

export async function fetchClients(): Promise<Client[]> {
  return apiClient('/clients')
}

export async function createClient(data: ClientFormData): Promise<Client> {
  return apiClient('/clients', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateClient(id: number, data: Partial<ClientFormData>): Promise<Client> {
  return apiClient(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteClient(id: number): Promise<void> {
  return apiClient(`/clients/${id}`, { method: 'DELETE' })
}