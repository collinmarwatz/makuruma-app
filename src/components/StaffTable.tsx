import type { Staff } from '../types/employee'
import { Pencil, Trash2, Paperclip } from 'lucide-react'

interface StaffTableProps {
  staff: Staff[]
  onEdit: (staff: Staff) => void
  onDelete: (staff: Staff) => void
}

function StaffTable({ staff, onEdit, onDelete }: StaffTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
          <tr>
            <th className="px-4 py-3">Full Name</th>
            <th className="px-4 py-3">Phone Number</th>
            <th className="px-4 py-3">TIN Number</th>
            <th className="px-4 py-3">Payment Account</th>
            <th className="px-4 py-3">Attachment</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {staff.map((member) => (
            <tr key={member.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-800">{member.full_name}</td>
              <td className="px-4 py-3 text-gray-600">{member.phone ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{member.tin_number ?? '—'}</td>
              <td className="px-4 py-3 text-gray-600">{member.payment_account ?? '—'}</td>
              <td className="px-4 py-3">
                {member.documents.length > 0 ? (
                  <Paperclip size={16} className="text-gray-400" />
                ) : (
                  <span className="text-gray-300">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(member)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit staff">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(member)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete staff">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {staff.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">No staff added yet. Click "Add Staff" to get started.</div>
      )}
    </div>
  )
}

export default StaffTable