import { useEffect, useState } from 'react'
import type { Truck } from '../types/truck'
import { fetchTrucks } from '../services/truckService'
import { downloadTruckProfitReport } from '../services/truckProfitReportService'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Download } from 'lucide-react'

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => currentYear - i)

function Reports() {
  const [trucks, setTrucks] = useState<Truck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYears, setSelectedYears] = useState<Record<number, number>>({})
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchTrucks()
        if (!cancelled) {
          setTrucks(data)
          const initialYears: Record<number, number> = {}
          data.forEach((t) => { initialYears[t.id] = currentYear })
          setSelectedYears(initialYears)
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load trucks')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  function setYearForTruck(truckId: number, year: number) {
    setSelectedYears((prev) => ({ ...prev, [truckId]: year }))
  }

  async function handleDownload(truck: Truck) {
    const year = selectedYears[truck.id] ?? currentYear
    setDownloadingId(truck.id)
    try {
      await downloadTruckProfitReport(truck.id, truck.reg_no, year)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    } finally {
      setDownloadingId(null)
    }
  }

  if (error) return <p className="p-8 text-destructive">Error: {error}</p>

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-1">Reports</h1>
      <p className="text-sm text-muted-foreground mb-6">Download the full Go &amp; Return profit report for any truck, for any year.</p>

      {loading ? (
        <TableSkeleton columns={5} />
      ) : (
        <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-surface-2 text-left text-muted-foreground uppercase text-xs tracking-wider">
              <tr>
                <th className="px-4 py-3">Truck Number</th>
                <th className="px-4 py-3">Trailer</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {trucks.map((truck) => (
                <tr key={truck.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">{truck.reg_no}</td>
                  <td className="px-4 py-3 text-muted-foreground">{truck.trailer?.reg_no ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{truck.driver?.full_name ?? '—'}</td>
                  <td className="px-4 py-3">
                    <select
                      value={selectedYears[truck.id] ?? currentYear}
                      onChange={(e) => setYearForTruck(truck.id, parseInt(e.target.value, 10))}
                      className="bg-secondary ring-1 ring-border rounded-lg px-2 py-1.5 text-sm text-foreground"
                    >
                      {YEAR_OPTIONS.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDownload(truck)}
                        disabled={downloadingId === truck.id}
                        className="flex items-center gap-1.5 bg-brand text-brand-foreground px-3 py-1.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        <Download size={14} />
                        {downloadingId === truck.id ? 'Downloading...' : 'Download Report'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {trucks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">No trucks registered yet.</div>
          )}
        </div>
      )}
    </div>
  )
}

export default Reports