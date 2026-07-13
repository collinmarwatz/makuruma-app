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

export interface TrackedTruck {
  id: number
  truck: Truck
  trailer: Trailer | null
  driver: Driver | null
  loading_point: string | null
  loading_point_arrival_date: string | null
  offloading_point: string | null
  offloading_date: string | null
  current_location: string | null
  current_status: TrackingStatus
  trip_leg: {
    direction: 'go' | 'return'
    trip: { trip_number: string }
  }
  milestones: TruckMilestone[]
}