import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Truck, Users as UsersIcon, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { UserCog, IdCard } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/trucks', label: 'Trucks', icon: Truck },
  { to: '/staff', label: 'Staff', icon: UserCog },
  { to: '/drivers', label: 'Drivers', icon: IdCard },
  { to: '/users', label: 'Users', icon: UsersIcon },
]


interface SidebarProps {
  isCollapsed: boolean
  onToggle: () => void
}

function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  const { user, logout } = useAuth()

  return (
    <aside
      className={`min-h-screen bg-white border-r border-gray-100 flex flex-col transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`px-4 py-5 border-b border-gray-100 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && (
          <div>
            <h1 className="text-lg font-bold text-gray-800">Makuruma</h1>
            <p className="text-xs text-gray-400">Logistics Management</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={isCollapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon size={18} className="flex-shrink-0" />
            {!isCollapsed && label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        {!isCollapsed && (
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">{user?.role?.name ?? 'No role'}</p>
          </div>
        )}
        <button
          onClick={logout}
          title={isCollapsed ? 'Log Out' : undefined}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut size={18} className="flex-shrink-0" />
          {!isCollapsed && 'Log Out'}
        </button>
      </div>
    </aside>
  )
}

export default Sidebar