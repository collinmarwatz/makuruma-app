import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface RevenueTrendChartProps {
  data: { month: string; total: string }[]
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-')
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No invoices yet.</p>
  }

  const chartData = data.map((d) => ({
    month: formatMonth(d.month),
    total: parseFloat(d.total),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#262629" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#97989d' }} />
        <YAxis tick={{ fontSize: 12, fill: '#97989d' }} tickFormatter={(v) => `$${v / 1000}k`} />
        <Tooltip
          formatter={(value) => `$${Number(value).toLocaleString()}`}
          contentStyle={{ background: '#171719', border: '1px solid #262629', borderRadius: 8, color: '#f1f1f4' }}
          labelStyle={{ color: '#f1f1f4' }}
          cursor={{ fill: '#262629' }}
        />
        <Bar dataKey="total" fill="#2a7f88" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueTrendChart