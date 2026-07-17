import { useEffect, useState } from 'react'
import type { Trip } from '../types/trip'
import { fetchTrips } from '../services/tripService'
import TripsTable from '../components/TripsTable'
import TableSkeleton from '../components/ui/TableSkeleton'

function Trips() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
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
    return () => { cancelled = true }
  }, [])

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Trips</h1>
      <p className="text-sm text-gray-400 mb-6">Each truck's Go and Return journey, linked by Trip Code.</p>

      {loading ? <TableSkeleton columns={7} /> : <TripsTable trips={trips} />}
    </div>
  )
}

export default Trips