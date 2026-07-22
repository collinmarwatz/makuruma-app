import { Loader2 } from 'lucide-react'

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-brand" size={32} />
        <p className="text-sm text-muted-foreground">Loading Makuruma...</p>
      </div>
    </div>
  )
}

export default PageLoader