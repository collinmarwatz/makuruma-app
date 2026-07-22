import { useEffect, useState } from 'react'
import type { Trailer } from '../types/trailer'
import { fetchTrailers, deleteTrailer } from '../services/trailerService'
import TrailerForm from '../components/TrailerForm'
import TrailerTable from '../components/TrailerTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Trailers() {
  const [trailers, setTrailers] = useState<Trailer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTrailer, setEditingTrailer] = useState<Trailer | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchTrailers()
        if (!cancelled) setTrailers(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trailers')
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
    setEditingTrailer(null)
    setIsModalOpen(true)
  }

  function openEditModal(trailer: Trailer) {
    setEditingTrailer(trailer)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(trailer: Trailer) {
    if (!window.confirm(`Delete trailer ${trailer.reg_no}? This can't be undone.`)) return
    try {
      await deleteTrailer(trailer.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete trailer')
    }
  }

  if (error) return <p className="p-8 text-destructive">Error: {error}</p>

  return (
    <div>
      <div className="flex items-center justify-end mb-6">
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-brand text-brand-foreground px-4 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
          Add Trailer
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={7} />
      ) : (
        <TrailerTable trailers={trailers} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTrailer ? `Edit Trailer — ${editingTrailer.reg_no}` : 'Add Trailer'}
      >
        <TrailerForm trailer={editingTrailer} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Trailers