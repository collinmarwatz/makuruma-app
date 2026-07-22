interface TableSkeletonProps {
  columns: number
  rows?: number
}

function TableSkeleton({ columns, rows = 5 }: TableSkeletonProps) {
  return (
    <div className="bg-card rounded-xl ring-1 ring-white/5 overflow-hidden">
      <div className="animate-pulse">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 px-4 py-3 border-b border-hairline last:border-0">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <div key={colIndex} className="h-4 bg-muted rounded flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableSkeleton