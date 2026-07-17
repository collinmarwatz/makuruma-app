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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 text-left text-gray-500 uppercase text-xs tracking-wide">
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
        <tbody className="divide-y divide-gray-100">
          {assets.map((asset) => {
            const categoryLabel = OFFICE_ASSET_CATEGORIES.find((c) => c.value === asset.category)?.label ?? asset.category
            const conditionInfo = OFFICE_ASSET_CONDITIONS.find((c) => c.value === asset.condition)
            return (
              <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800">{asset.name}</td>
                <td className="px-4 py-3 text-gray-600">{categoryLabel}</td>
                <td className="px-4 py-3 text-gray-600">{asset.serial_number ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{asset.buying_price ? `TZS ${parseFloat(asset.buying_price).toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3 text-gray-600">{asset.purchase_date?.slice(0, 10) ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{asset.location ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge label={conditionInfo?.label ?? asset.condition} color={conditionInfo?.color ?? 'gray'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(asset)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(asset)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
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
        <div className="text-center py-12 text-gray-400 text-sm">No office assets registered yet.</div>
      )}
    </div>
  )
}

export default OfficeAssetTable