import { useEffect, useState } from 'react'
import type { Vendor } from '../types/partner'
import { fetchVendors, deleteVendor } from '../services/vendorService'
import VendorForm from '../components/VendorForm'
import VendorTable from '../components/VendorTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Vendors() {
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchVendors()
        if (!cancelled) setVendors(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load vendors')
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
    setEditingVendor(null)
    setIsModalOpen(true)
  }

  function openEditModal(vendor: Vendor) {
    setEditingVendor(vendor)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(vendor: Vendor) {
    if (!window.confirm(`Delete vendor ${vendor.company_name}? This can't be undone.`)) return
    try {
      await deleteVendor(vendor.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete vendor')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Vendors</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Vendor
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={4} />
      ) : (
        <VendorTable vendors={vendors} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVendor ? `Edit Vendor — ${editingVendor.company_name}` : 'Add Vendor'}
      >
        <VendorForm vendor={editingVendor} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Vendors