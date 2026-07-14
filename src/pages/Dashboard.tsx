import { useEffect, useState } from 'react'
import type { DashboardSummary } from '../types/dashboard'
import { fetchDashboardSummary } from '../services/dashboardService'
import { useAuth } from '../hooks/useAuth'
import StatCard from '../components/ui/StatCard'
import ComplianceAlerts from '../components/ComplianceAlerts'
import ExpenseByCategoryChart from '../components/dashboard/ExpenseByCategoryChart'
import RevenueTrendChart from '../components/dashboard/RevenueTrendChart'
import { Truck, MapPin, Receipt, FileText, ClipboardList, AlertOctagon } from 'lucide-react'

function Dashboard() {
  const { user } = useAuth()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await fetchDashboardSummary()
        if (!cancelled) setSummary(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !summary) return <p className="p-8 text-red-500">Error: {error}</p>

  const inTransitCount = summary.tracking.in_transit + summary.tracking.at_border + summary.tracking.offloading

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-400">Here's what's happening across your fleet today.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Active Trucks"
          value={`${summary.fleet.active} / ${summary.fleet.total}`}
          icon={Truck}
          accent="blue"
          subtext={`${summary.fleet.maintenance} in maintenance`}
        />
        <StatCard
          label="Trucks In Transit"
          value={inTransitCount}
          icon={MapPin}
          accent="yellow"
          subtext={`${summary.tracking.delayed} delayed`}
        />
        <StatCard
          label="Pending Expenses"
          value={summary.expenses.pending_count}
          icon={Receipt}
          accent="red"
          subtext={`$${summary.expenses.pending_total.toLocaleString()} awaiting approval`}
        />
        <StatCard
          label="Invoiced This Month"
          value={`$${summary.invoicing.this_month.toLocaleString()}`}
          icon={FileText}
          accent="green"
          subtext={`$${summary.invoicing.total_invoiced.toLocaleString()} all-time`}
        />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Active Bookings"
          value={summary.bookings.awaiting_return}
          icon={ClipboardList}
          accent="yellow"
          subtext="Awaiting return leg"
        />
        <StatCard
          label="Completed Bookings"
          value={summary.bookings.completed}
          icon={ClipboardList}
          accent="green"
          subtext={`${summary.bookings.this_month} created this month`}
        />
        <StatCard
          label="Compliance Alerts"
          value={summary.compliance.expired + summary.compliance.expiring_soon}
          icon={AlertOctagon}
          accent="red"
          subtext={`${summary.compliance.expired} already expired`}
        />
      </div>

      {/* Charts + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1">
          <h3 className="font-bold text-gray-800 mb-2">Expenses by Category</h3>
          <ExpenseByCategoryChart data={summary.expenses.by_category} />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1">
          <h3 className="font-bold text-gray-800 mb-2">Revenue Trend (Invoiced)</h3>
          <RevenueTrendChart data={summary.invoicing.monthly_trend} />
        </div>

        <div className="lg:col-span-1">
          <ComplianceAlerts documents={summary.compliance.upcoming} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard