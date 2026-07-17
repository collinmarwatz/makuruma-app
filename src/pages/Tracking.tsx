import { useEffect, useMemo, useState } from 'react'
import type { TrackedTruck, TrackingStatus } from '../types/tracking'
import { fetchTrackedTrucks, downloadTrackingReport, downloadTrackingExcel } from '../services/trackingService'
import { fetchClients } from '../services/clientService'
import type { Client } from '../types/partner'
import { exportTrackingCsv } from '../utils/csvExports'
import { TRACKING_STATUS_OPTIONS } from '../constants/trackingStatus'
import TrackingTable from '../components/TrackingTable'
import TrackingDetailForm from '../components/TrackingDetailForm'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Download, Search, FileSpreadsheet } from 'lucide-react'

type TripStatusTab = 'all' | 'go' | 'return' | 'off_duty'

function Tracking() {
  const [trucks, setTrucks] = useState<TrackedTruck[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [selectedTruck, setSelectedTruck] = useState<TrackedTruck | null>(null)

  const [tripStatusTab, setTripStatusTab] = useState<TripStatusTab>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TrackingStatus | 'all'>('all')
  const [clientFilter, setClientFilter] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [isExporting, setIsExporting] = useState(false)
  const [isExportingExcel, setIsExportingExcel] = useState(false)

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

  const tabCounts = useMemo(() => {
    return {
      all: trucks.length,
      go: trucks.filter((t) => t.trip_status === 'go').length,
      return: trucks.filter((t) => t.trip_status === 'return').length,
      off_duty: trucks.filter((t) => t.trip_status === 'off_duty').length,
    }
  }, [trucks])

  const filteredTrucks = useMemo(() => {
    return trucks.filter((truck) => {
      const matchesTab = tripStatusTab === 'all' || truck.trip_status === tripStatusTab
      const matchesStatus = statusFilter === 'all' || truck.current_status === statusFilter
      const recentBooking = truck.booking_trucks?.[0]
      const matchesClient = !clientFilter || recentBooking?.booking.client?.id.toString() === clientFilter
      const search = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !search ||
        truck.reg_no.toLowerCase().includes(search) ||
        (truck.driver?.full_name.toLowerCase().includes(search) ?? false) ||
        (recentBooking?.trip?.trip_code.toLowerCase().includes(search) ?? false)

      return matchesTab && matchesStatus && matchesClient && matchesSearch
    })
  }, [trucks, searchTerm, statusFilter, clientFilter, tripStatusTab])

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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setIsExporting(false)
    }
  }

  async function handleExportExcel() {
    setIsExportingExcel(true)
    try {
      await downloadTrackingExcel({
        trip_status: tripStatusTab,
        current_status: statusFilter,
        client_id: clientFilter,
        search: searchTerm,
      })
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Excel export failed')
    } finally {
      setIsExportingExcel(false)
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  const tabs: { value: TripStatusTab; label: string }[] = [
    { value: 'all', label: `All Trucks (${tabCounts.all})` },
    { value: 'go', label: `Go Trucks (${tabCounts.go})` },
    { value: 'return', label: `Return Trucks (${tabCounts.return})` },
    { value: 'off_duty', label: `Off Duty (${tabCounts.off_duty})` },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold text-gray-800">Tracking</h1>
        <div className="flex gap-2">
          <button
            onClick={handleExportCsv}
            disabled={isExporting || filteredTrucks.length === 0}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Download size={18} />
            {isExporting ? 'Exporting...' : `Export CSV ${filteredTrucks.length > 0 ? `(${filteredTrucks.length})` : ''}`}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={isExportingExcel}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FileSpreadsheet size={18} />
            {isExportingExcel ? 'Exporting...' : 'Export Excel'}
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-4">Live status and checkpoint milestones for every truck in your fleet.</p>

      <div className="flex gap-2 mb-4 bg-gray-100 rounded-lg p-1 w-fit overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setTripStatusTab(tab.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              tripStatusTab === tab.value ? 'bg-white shadow-sm text-blue-700' : 'text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by truck, driver, or trip code..."
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
        <TableSkeleton columns={14} />
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