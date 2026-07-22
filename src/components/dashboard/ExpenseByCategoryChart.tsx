import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface ExpenseByCategoryChartProps {
  data: { trip: number; office: number; truck: number }
}

const COLORS = ['#2563eb', '#f59e0b', '#10b981']

function ExpenseByCategoryChart({ data }: ExpenseByCategoryChartProps) {
  const chartData = [
    { name: 'Trip', value: data.trip },
    { name: 'Office', value: data.office },
    { name: 'Truck', value: data.truck },
  ].filter((d) => d.value > 0)

  if (chartData.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No expense data yet.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={(entry) => `Sh${entry.value.toLocaleString()}`}>
          {chartData.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `Tsh${Number(value).toLocaleString()}`}
          contentStyle={{ background: '#171719', border: '1px solid #262629', borderRadius: 8, color: '#f1f1f4' }}
          labelStyle={{ color: '#f1f1f4' }}
        />
        <Legend wrapperStyle={{ color: '#97989d' }} />
      </PieChart>
    </ResponsiveContainer>
  )
}

export default ExpenseByCategoryChart