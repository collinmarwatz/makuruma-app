import { useEffect, useState } from 'react'
import type { Client } from '../types/partner'
import { fetchClients, deleteClient } from '../services/clientService'
import ClientForm from '../components/ClientForm'
import ClientTable from '../components/ClientTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Clients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchClients()
        if (!cancelled) setClients(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load clients')
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
    setEditingClient(null)
    setIsModalOpen(true)
  }

  function openEditModal(client: Client) {
    setEditingClient(client)
    setIsModalOpen(true)
  }

  function handleSaved() {
    setIsModalOpen(false)
    refresh()
  }

  async function handleDelete(client: Client) {
    if (!window.confirm(`Delete client ${client.company_name}? This can't be undone.`)) return
    try {
      await deleteClient(client.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete client')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {loading ? (
        <TableSkeleton columns={4} />
      ) : (
        <ClientTable clients={clients} onEdit={openEditModal} onDelete={handleDelete} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingClient ? `Edit Client — ${editingClient.company_name}` : 'Add Client'}
      >
        <ClientForm client={editingClient} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Clients