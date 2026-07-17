import type { Truck } from './truck'
import type { Trailer } from './trailer'
import type { Driver } from './employee'
import type { Client } from './partner'

export interface TripBookingTruck {
  id: number
  booking_id: number
  cargo: string | null
  rate: string | null
  capacity: string | null
  is_overdue: boolean
  booking: {
    id: number
    booking_number: string
    direction: 'go' | 'return'
    eta: string | null
    loading_point: string | null
    offloading_point: string | null
    client: Client
  }
  trailer: Trailer | null
  driver: Driver | null
}

export interface Trip {
  id: number
  trip_code: string
  truck: Truck
  go_booking_truck: TripBookingTruck | null
  return_booking_truck: TripBookingTruck | null
  created_at: string
}