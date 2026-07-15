import type { Truck } from './truck'
import type { Trailer } from './trailer'
import type { Driver } from './employee'

export interface Checkpoint {
  id: number
  name: string
  sequence_order: number
}

export interface TruckMilestone {
  id: number
  checkpoint: Checkpoint
  arrival_at: string | null
  dispatch_at: string | null
}

export type TrackingStatus = 'loading' | 'in_transit' | 'at_border' | 'offloading' | 'delayed' | 'completed'

export interface RecentBooking {
  loading_point: string | null
  offloading_point: string | null
  trip_leg: {
    trip: { trip_number: string }
  }
}

export interface TrackedTruck extends Truck {
  trailer: Trailer | null
  driver: Driver | null
  current_location: string | null
  current_status: TrackingStatus
  milestones: TruckMilestone[]
  booking_trucks: RecentBooking[]
}