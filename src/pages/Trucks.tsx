import { useEffect, useState } from 'react'
import type { Truck } from '../types/truck'
import { fetchTrucks, deleteTruck } from '../services/truckService'
import TruckForm from '../components/TruckForm'
import TruckTable from '../components/TruckTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Trucks() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTruck, setEditingTruck] = useState<Truck | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTrucks() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }

      try {
        const data = await fetchTrucks()
        if (!cancelled) setTrucks(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trucks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTrucks()

    return () => {
      cancelled = true
    }
  }, [reloadTrigger])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
  }

  function openAddModal() {
    setEditingTruck(null)
    setIsModalOpen(true)
  }

  function openEditModal(truck: Truck) {
    setEditingTruck(truck)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(truck: Truck) {
    const confirmed = window.confirm(`Delete truck ${truck.reg_no}? This can't be undone.`)
    if (!confirmed) return

    try {
      await deleteTruck(truck.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete truck')
    }
  }

  if (error) return <p className="p-8 text-destructive">Error: {error}</p>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Truck
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={10} />
      ) : (
        <TruckTable trucks={trucks} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTruck ? `Edit Truck — ${editingTruck.reg_no}` : 'Add Truck'}
      >
        <TruckForm truck={editingTruck} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Trucks