import { Loader2 } from 'lucide-react'

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm text-gray-400">Loading Makuruma...</p>
      </div>
    </div>
  )
}

export default PageLoader