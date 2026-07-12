import { useEffect, useState } from 'react'
import type { Driver } from '../types/employee'
import { fetchDrivers, deleteDriver } from '../services/driverService'
import DriverForm from '../components/DriverForm'
import DriverTable from '../components/DriverTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchDrivers()
        if (!cancelled) setDrivers(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load drivers')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [reloadTrigger])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
  }

  function openAddModal() {
    setEditingDriver(null)
    setIsModalOpen(true)
  }

  function openEditModal(driver: Driver) {
    setEditingDriver(driver)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(driver: Driver) {
    if (!window.confirm(`Delete ${driver.full_name}? This can't be undone.`)) return
    try {
      await deleteDriver(driver.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete driver')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Drivers</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Driver
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <DriverTable drivers={drivers} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? `Edit Driver — ${editingDriver.full_name}` : 'Add Driver'}
      >
        <DriverForm driver={editingDriver} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Drivers