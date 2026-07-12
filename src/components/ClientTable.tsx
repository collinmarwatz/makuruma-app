import type { Client } from '../types/partner'
import { Pencil, Trash2 } from 'lucide-react'

interface ClientTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Company Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{client.company_name}</td>
              <td className="px-4 py-3 text-gray-600">{client.email ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{client.phone ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(client)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit client">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(client)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete client">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clients.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No clients added yet. Click "Add Client" to get started.</div>
      )}
    </div>
  )
}

export default ClientTable