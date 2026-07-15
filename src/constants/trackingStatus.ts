import type { TrackingStatus } from '../types/tracking'

export const TRACKING_STATUS_OPTIONS: { value: TrackingStatus; label: string }[] = [
  { value: 'loading', label: 'Loading' },
  { value: 'in_transit', label: 'In Transit' },
  { value: 'at_border', label: 'At Border' },
  { value: 'offloading', label: 'Offloading' },
  { value: 'delayed', label: 'Delayed' },
  { value: 'breakdown', label: 'Breakdown' },
  { value: 'completed', label: 'Completed' },
]

export const TRACKING_STATUS_COLORS: Record<TrackingStatus, 'green' | 'yellow' | 'red' | 'gray'> = {
  loading: 'gray',
  in_transit: 'yellow',
  at_border: 'yellow',
  offloading: 'yellow',
  delayed: 'red',
  breakdown: 'red',
  completed: 'green',
}