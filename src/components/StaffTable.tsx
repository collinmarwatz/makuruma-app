import type { Staff } from '../types/employee'
import { Pencil, Trash2, Paperclip } from 'lucide-react'

interface StaffTableProps {
  staff: Staff[]
  onEdit: (staff: Staff) => void
  onDelete: (staff: Staff) => void
}

function StaffTable({ staff, onEdit, onDelete }: StaffTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Phone Number</th>
            <th className="px-4 py-3">TIN Number</th>
            <th className="px-4 py-3">Payment Account</th>
            <th className="px-4 py-3">Attachment</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{member.full_name}</td>
              <td className="px-4 py-3 text-muted-foreground">{member.phone ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{member.tin_number ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{member.payment_account ?? '—'}</td>
              <td className="px-4 py-3">
                {member.documents.length > 0 ? (
                  <Paperclip size={16} className="text-muted-foreground" />
                ) : (
                  <span className="text-muted-foreground/50">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(member)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit staff">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(member)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete staff">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {staff.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No staff added yet. Click "Add Staff" to get started.</div>
      )}
    </div>
  )
}

export default StaffTable