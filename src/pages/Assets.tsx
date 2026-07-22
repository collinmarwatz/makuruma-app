import { useState } from 'react'
import Trucks from './Trucks'
import Trailers from './Trailers'
import OfficeAssets from './OfficeAssets'

type Tab = 'trucks' | 'trailers' | 'office'

function Assets() {
  const [tab, setTab] = useState<Tab>('trucks')

  const tabs: { value: Tab; label: string }[] = [
    { value: 'trucks', label: 'Trucks' },
    { value: 'trailers', label: 'Trailers' },
    { value: 'office', label: 'Office Assets' },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-4">Assets</h1>

      <div className="flex gap-2 mb-6 bg-surface-2 rounded-lg p-1 w-fit ring-1 ring-white/5">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-card text-brand shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'trucks' && <Trucks />}
      {tab === 'trailers' && <Trailers />}
      {tab === 'office' && <OfficeAssets />}
    </div>
  )
}

export default Assets