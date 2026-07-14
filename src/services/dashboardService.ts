import type { DashboardSummary } from '../types/dashboard'
import { apiClient } from './apiClient'

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  return apiClient('/dashboard/summary')
}