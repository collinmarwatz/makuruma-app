import type { Trip } from '../types/trip'
import { apiClient } from './apiClient'

export async function fetchTrips(): Promise<Trip[]> {
  return apiClient('/trips')
}