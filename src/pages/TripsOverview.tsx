import { useEffect, useState } from 'react'
import type { Trip } from '../types/trip'
import { fetchTrips } from '../services/tripService'
import Badge from '../components/ui/Badge'
import TableSkeleton from '../components/ui/TableSkeleton'

function TripsOverview() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchTrips()
        if (!cancelled) setTrips(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trips')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Trips</h1>
      <p className="text-sm text-gray-400 mb-6">Track booking status across Go and Return legs.</p>

      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
              <tr>
                <th className="px-4 py-3">Trip Number</th>
                <th className="px-4 py-3">Go Client</th>
                <th className="px-4 py-3">Go Trucks</th>
                <th className="px-4 py-3">Return Client</th>
                <th className="px-4 py-3">Return Trucks</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {trips.map((trip) => {
                const goLeg = trip.legs.find((l) => l.direction === 'go')
                const returnLeg = trip.legs.find((l) => l.direction === 'return')
                const isComplete = !!returnLeg

                return (
                  <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{trip.trip_number}</td>
                    <td className="px-4 py-3 text-gray-600">{goLeg?.client?.company_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {goLeg?.booking_trucks.map((bt) => bt.truck.reg_no).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{returnLeg?.client?.company_name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {returnLeg?.booking_trucks.map((bt) => bt.truck.reg_no).join(', ') || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={isComplete ? 'Completed' : 'Awaiting Return'} color={isComplete ? 'green' : 'yellow'} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {trips.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">No trips yet.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default TripsOverview