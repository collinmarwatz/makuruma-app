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
      <div className="min-h-screen bg-background p-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-xl ring-1 ring-white/5 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !summary) return <p className="p-8 text-destructive">Error: {error}</p>

  const inTransitCount = summary.tracking.in_transit + summary.tracking.at_border + summary.tracking.offloading
  const complianceTotal = summary.compliance.expired + summary.compliance.expiring_soon

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-balance text-foreground">
          Welcome back, {user?.name?.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's what's happening across your fleet today.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <StatCard
          label="Active Trucks"
          value={`${summary.fleet.active} / ${summary.fleet.total}`}
          icon={Truck}
          tone="brand"
          sub={`${summary.fleet.maintenance} in maintenance`}
        />
        <StatCard
          label="Trucks In Transit"
          value={inTransitCount}
          icon={MapPin}
          tone="warn"
          sub={`${summary.tracking.delayed} delayed`}
        />
        <StatCard
          label="Pending Expenses"
          value={summary.expenses.pending_count}
          icon={Receipt}
          tone="destructive"
          sub={`$${summary.expenses.pending_total.toLocaleString()} awaiting approval`}
        />
        <StatCard
          label="Invoiced This Month"
          value={`$${summary.invoicing.this_month.toLocaleString()}`}
          icon={FileText}
          tone="brand"
          sub={`$${summary.invoicing.total_invoiced.toLocaleString()} all-time`}
        />
      </div>

      {/* Second KPI row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          label="Active Bookings"
          value={summary.bookings.awaiting_return}
          icon={ClipboardList}
          tone="warn"
          sub="Awaiting return leg"
        />
        <StatCard
          label="Completed Bookings"
          value={summary.bookings.completed}
          icon={ClipboardList}
          tone="brand"
          sub={`${summary.bookings.this_month} created this month`}
        />
        <StatCard
          label="Compliance Alerts"
          value={complianceTotal}
          icon={AlertOctagon}
          tone="destructive"
          sub={`${summary.compliance.expired} already expired`}
          badge={summary.compliance.expired > 0 ? { label: 'CRITICAL' } : undefined}
        />
      </div>

      {/* Charts + Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-surface-2 rounded-xl ring-1 ring-white/5 p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4">Expenses by Category</h3>
          <ExpenseByCategoryChart data={summary.expenses.by_category} />
        </div>

        <div className="bg-surface-2 rounded-xl ring-1 ring-white/5 p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4">Revenue Trend (Invoiced)</h3>
          <RevenueTrendChart data={summary.invoicing.monthly_trend} />
        </div>

        <div className="bg-surface-2 rounded-xl ring-1 ring-white/5 p-6 lg:col-span-1">
          <h3 className="text-sm font-semibold text-foreground mb-4">Upcoming Compliance Deadlines</h3>
          <ComplianceAlerts documents={summary.compliance.upcoming} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard