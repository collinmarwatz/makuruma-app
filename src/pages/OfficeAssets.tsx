import { useEffect, useState } from 'react'
import type { OfficeAsset } from '../types/OfficeAsset'
import { fetchOfficeAssets, deleteOfficeAsset } from '../services/officeAssetService'
import OfficeAssetForm from '../components/OfficeAssetForm'
import OfficeAssetTable from '../components/OfficeAssetTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function OfficeAssets() {
  const [assets, setAssets] = useState<OfficeAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAsset, setEditingAsset] = useState<OfficeAsset | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) { setLoading(true); setError(null) }
      try {
        const data = await fetchOfficeAssets()
        if (!cancelled) setAssets(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load office assets')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [reloadTrigger])

  function refresh() { setReloadTrigger((prev) => prev + 1) }
  function openAddModal() { setEditingAsset(null); setIsModalOpen(true) }
  function openEditModal(asset: OfficeAsset) { setEditingAsset(asset); setIsModalOpen(true) }
  function handleSaved() { setIsModalOpen(false); refresh() }

  async function handleDelete(asset: OfficeAsset) {
    if (!window.confirm(`Delete asset "${asset.name}"?`)) return
    try {
      await deleteOfficeAsset(asset.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete asset')
    }
  }

  if (error) return <p className="text-red-500">Error: {error}</p>

  return (
    <div>
      <div className="flex items-center justify-end mb-4">
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Add Office Asset
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={8} />
      ) : (
        <OfficeAssetTable assets={assets} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? `Edit Asset — ${editingAsset.name}` : 'Add Office Asset'}>
        <OfficeAssetForm asset={editingAsset} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default OfficeAssets