import type { Truck } from './truck'
import type { Trailer } from './trailer'
import type { Driver } from './employee'
import type { Document } from './truck'

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

export type TrackingStatus = 'loading' | 'in_transit' | 'at_border' | 'offloading' | 'delayed' | 'breakdown' | 'completed'

export interface RecentBooking {
  id: number
  actual_loading_date: string | null
  actual_offloading_date: string | null
  is_overdue: boolean
  truck_trip_code: string
  documents: Document[]
  trip_leg: {
    direction: 'go' | 'return'
    loading_point: string | null
    offloading_point: string | null
    client: { id: number; company_name: string } | null
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