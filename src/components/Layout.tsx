import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

function Layout() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed((prev) => !prev)} />
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}

export default Layout