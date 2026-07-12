import { useEffect, useState } from 'react'
import type { Truck } from '../types/truck.ts'
import TruckCard from '../components/TruckCard.tsx.tsx'
import { fetchTrucks } from '../services/truckService.ts'
import { useAuth } from '../hooks/useAuth.ts'

function Dashboard() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, logout } = useAuth()

  useEffect(() => {
    fetchTrucks()
      .then(setTrucks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="p-8 text-gray-500">Loading trucks...</p>
  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Makuruma Fleet</h1>
          <p className="text-gray-500 text-sm">Welcome, {user?.name}</p>
        </div>
        <button
          onClick={logout}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Log Out
        </button>
      </div>
      <div className="flex flex-wrap gap-6">
        {trucks.map((truck) => (
          <TruckCard key={truck.id} truck={truck} />
        ))}
      </div>
    </div>
  )
}

export default Dashboard