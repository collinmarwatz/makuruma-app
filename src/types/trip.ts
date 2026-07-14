import type { Truck } from './truck'
import type { Trailer } from './trailer'
import type { Driver } from './employee'
import type { Client } from './partner'

export interface BookingTruck {
  id: number
  truck: Truck
  trailer: Trailer | null
  driver: Driver | null
  capacity_override: string | null
  cargo: string | null
  loading_point: string | null
  loading_point_arrival_date: string | null
  offloading_point: string | null
  offloading_date: string | null
  invoiced_transit_weight: string | null
  invoiced_detention_charge: string | null
  rate: string | null
  quantity: string | null
  amount: string | null
}

export interface TripLeg {
  id: number
  direction: 'go' | 'return'
  client: Client | null
  eta: string | null
  location: string | null
  item_sn: string | null
  description: string | null
  booking_trucks: BookingTruck[]
}

export interface Trip {
  id: number
  trip_number: string
  legs: TripLeg[]
}