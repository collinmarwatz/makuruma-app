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

export type TrackingStatus = 'pending' | 'loading' | 'in_transit' | 'at_border' | 'offloading' | 'delayed' | 'breakdown' | 'completed'

export interface RecentBooking {
  id: number
  loading_point_arrival_date: string | null
  loading_date: string | null
  loading_dispatch_date: string | null
  offloading_point_arrival_date: string | null
  offloading_date: string | null
  is_overdue: boolean
  documents: Document[]
  booking: {
    booking_number: string
    direction: 'go' | 'return'
    loading_point: string | null
    offloading_point: string | null
    client: { id: number; company_name: string } | null
  }
  trip: { id: number; trip_code: string } | null
}

export interface TrackedTruck extends Truck {
  trailer: Trailer | null
  driver: Driver | null
  trip_status: 'go' | 'return' | 'off_duty'
  current_location: string | null
  current_status: TrackingStatus
  milestones: TruckMilestone[]
  booking_trucks: RecentBooking[]
}