import type { Truck } from './truck'
import type { Trailer } from './trailer'
import type { Driver } from './employee'
import type { Client } from './partner'
import type { Document } from './truck'

export interface BookingTruck {
  id: number
  booking_id: number
  trip_id: number | null
  capacity: string | null
  cargo: string | null
  rate: string | null
  loading_point_arrival_date: string | null
  loading_date: string | null
  loading_dispatch_date: string | null
  offloading_point_arrival_date: string | null
  offloading_date: string | null
  is_overdue: boolean
  truck: Truck
  trailer: Trailer | null
  driver: Driver | null
  documents: Document[]
  trip: { id: number; trip_code: string } | null
}

export interface Booking {
  id: number
  booking_number: string
  direction: 'go' | 'return'
  client: Client
  eta: string | null
  location: string | null
  loading_point: string | null
  offloading_point: string | null
  description: string | null
  creator: { id: number; name: string }
  booking_trucks: BookingTruck[]
  created_at: string
}

export interface EligibleTruck extends Truck {
  trailer: Trailer | null
  driver: Driver | null
}