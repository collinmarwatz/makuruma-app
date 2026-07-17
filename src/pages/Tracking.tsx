import { useEffect, useMemo, useState } from 'react'
import type { TrackedTruck, TrackingStatus } from '../types/tracking'
import { fetchTrackedTrucks, downloadTrackingReport } from '../services/trackingService'
import { fetchClients } from '../services/clientService'
import type { Client } from '../types/partner'
import { exportTrackingCsv } from '../utils/csvExports'
import { TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'
import TrackingTable from '../components/TrackingTable'
import TrackingDetailForm from '../components/TrackingDetailForm'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Download, Search } from 'lucide-react'

function Tracking() {
  const [trucks, setTrucks] = useState<TrackedTruck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [selectedTruck, setSelectedTruck] = useState<TrackedTruck | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TrackingStatus | 'all'>('all')
  const [clientFilter, setClientFilter] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchClients().then(setClients).catch(() => setClients([]))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await fetchTrackedTrucks()
        if (!cancelled) {
          setTrucks(data)
          if (selectedTruck) {
            const refreshed = data.find((t) => t.id === selectedTruck.id)
            if (refreshed) setSelectedTruck(refreshed)
          }
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load tracking data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadTrigger])

  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const matchesStatus = statusFilter === 'all' || truck.current_status === statusFilter
      const recentBooking = truck.booking_trucks?.[0]
      const matchesClient = !clientFilter || recentBooking?.trip_leg.client?.id.toString() === clientFilter
      const search = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !search ||
        truck.reg_no.toLowerCase().includes(search) ||
        (truck.driver?.full_name.toLowerCase().includes(search) ?? false) ||
        (recentBooking?.trip_leg.trip.trip_number.toLowerCase().includes(search) ?? false) ||
        (recentBooking?.truck_trip_code.toLowerCase().includes(search) ?? false)

      return matchesStatus && matchesClient && matchesSearch
    })
  }, [trucks, searchTerm, statusFilter, clientFilter])

  function refresh() {
    setReloadTrigger((prev) => prev + 1)
  }

  async function handleDownloadReport(truck: TrackedTruck) {
    try {
      await downloadTrackingReport(truck)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    }
  }

  function handleExportCsv() {
    setIsExporting(true)
    try {
      exportTrackingCsv(filteredTrucks)
    } finally {
      setIsExporting(false)
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={handleExportCsv}
          disabled={isExporting || filteredTrucks.length === 0}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Download size={18} />
          Export {filteredTrucks.length > 0 ? `(${filteredTrucks.length})` : ''}
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-4">Live status and checkpoint milestones for every truck in your fleet.</p>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by truck, driver, or booking number..."
            className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Clients</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.company_name}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TrackingStatus | 'all')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          {TRACKING_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <TableSkeleton columns={9} />
      ) : (
        <TrackingTable trucks={filteredTrucks} onView={setSelectedTruck} onDownload={handleDownloadReport} />
      )}

      <Modal
        isOpen={!!selectedTruck}
        onClose={() => setSelectedTruck(null)}
        title={selectedTruck ? `Tracking — ${selectedTruck.reg_no}` : ''}
      >
        {selectedTruck && <TrackingDetailForm truck={selectedTruck} onSaved={refresh} />}
      </Modal>
    </div>
  )
}

export default Tracking