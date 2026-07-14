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
    return <p className="text-sm text-gray-400 text-center py-12">No invoices yet.</p>
  }

  const chartData = data.map((d) => ({
    month: formatMonth(d.month),
    total: parseFloat(d.total),
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v / 1000}k`} />
        <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
        <Bar dataKey="total" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default RevenueTrendChart