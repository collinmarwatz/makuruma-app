import type { Client } from '../types/partner'
import Badge from './ui/Badge'
import { Pencil, Trash2 } from 'lucide-react'


interface ClientTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

function ClientTable({ clients, onEdit, onDelete }: ClientTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Company Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3">Advance Invoicing</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {clients.map((client) => (
            <tr key={client.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{client.company_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{client.email ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{client.phone ?? '—'}</td>
              <td className="px-4 py-3">
  <Badge label={client.allows_advance_invoice ? 'Allowed' : 'Not Allowed'} color={client.allows_advance_invoice ? 'green' : 'gray'} />
</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(client)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit client">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(client)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete client">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {clients.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No clients added yet. Click "Add Client" to get started.</div>
      )}
    </div>
  )
}

export default ClientTable