import type { OfficeAsset } from '../types/OfficeAsset'
import Badge from './ui/Badge'
import { OFFICE_ASSET_CATEGORIES, OFFICE_ASSET_CONDITIONS } from '../constants/officeAssetOptions'
import { Pencil, Trash2 } from 'lucide-react'

interface OfficeAssetTableProps {
  assets: OfficeAsset[]
  onEdit: (asset: OfficeAsset) => void
  onDelete: (asset: OfficeAsset) => void
}

function OfficeAssetTable({ assets, onEdit, onDelete }: OfficeAssetTableProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Serial No.</th>
            <th className="px-4 py-3">Buying Price</th>
            <th className="px-4 py-3">Purchase Date</th>
            <th className="px-4 py-3">Location</th>
            <th className="px-4 py-3">Condition</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hairline">
          {assets.map((asset) => {
            const categoryLabel = OFFICE_ASSET_CATEGORIES.find((c) => c.value === asset.category)?.label ?? asset.category
            const conditionInfo = OFFICE_ASSET_CONDITIONS.find((c) => c.value === asset.condition)
            return (
              <tr key={asset.id} className="hover:bg-surface transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{asset.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{categoryLabel}</td>
                <td className="px-4 py-3 text-muted-foreground">{asset.serial_number ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{asset.buying_price ? `TZS ${parseFloat(asset.buying_price).toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{asset.purchase_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-muted-foreground">{asset.location ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={conditionInfo?.label ?? asset.condition} color={conditionInfo?.color ?? 'gray'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(asset)} className="p-1.5 text-muted-foreground hover:text-brand hover:bg-brand/10 rounded-lg transition-colors" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(asset)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors" title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {assets.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">No office assets registered yet.</div>
      )}
    </div>
  )
}

export default OfficeAssetTable