import type { Vendor } from '../types/partner'
import Badge from './ui/Badge'
import { Pencil, Trash2 } from 'lucide-react'

interface VendorTableProps {
  vendors: Vendor[]
  onEdit: (vendor: Vendor) => void
  onDelete: (vendor: Vendor) => void
}

function VendorTable({ vendors, onEdit, onDelete }: VendorTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Company Name</th>
            <th className="px-4 py-3">Vendor Type</th>
            <th className="px-4 py-3">Phone</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="hover:bg-surface transition-colors">
              <td className="px-4 py-3 font-medium text-foreground">{vendor.company_name}</td>
              <td className="px-4 py-3">
                <Badge label={vendor.vendor_type === 'fuel' ? 'Fuel' : 'E-seal'} color={vendor.vendor_type === 'fuel' ? 'yellow' : 'gray'} />
              </td>
              <td className="px-4 py-3 text-muted-foreground">{vendor.phone ?? '—'}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button onClick={() => onEdit(vendor)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit vendor">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => onDelete(vendor)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete vendor">
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {vendors.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No vendors added yet. Click "Add Vendor" to get started.</div>
      )}
    </div>
  )
}

export default VendorTable