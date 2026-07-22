import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Route as RouteIcon, MapPin, Package,
  UserCog, IdCard, Building2, Store, Receipt, FileText, BarChart3, Scale,
  Users as UsersIcon, LogOut, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import logo from '../assets/logo.png'

const primaryNavItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', icon: ClipboardList },
  { to: '/trips', label: 'Trips', icon: RouteIcon },
  { to: '/tracking', label: 'Tracking', icon: MapPin },
]

const secondaryNavItems = [
  { to: '/assets', label: 'Assets', icon: Package },
  { to: '/staff', label: 'Staff', icon: UserCog },
  { to: '/drivers', label: 'Drivers', icon: IdCard },
  { to: '/clients', label: 'Clients', icon: Building2 },
  { to: '/vendors', label: 'Vendors', icon: Store },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/invoices', label: 'Invoices', icon: FileText },
  { to: '/reconciliation', label: 'Reconciliation', icon: Scale },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
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
      className={`sticky top-0 flex h-screen shrink-0 flex-col border-r border-hairline bg-background transition-all duration-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className={`flex h-20 items-center border-b border-hairline px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <img src={logo} alt="Makuruma Logistics" className="h-9 w-auto" />}
        <button
          onClick={onToggle}
          className="grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {primaryNavItems.map((item) => (
          <SidebarLink key={item.to} item={item} isCollapsed={isCollapsed} />
        ))}

        <div className="my-4 h-px bg-hairline/60" />

        {secondaryNavItems.map((item) => (
          <SidebarLink key={item.to} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      <div className="mt-auto border-t border-hairline p-3">
        {!isCollapsed && (
          <div className="px-2 py-2 mb-1">
            <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user?.role?.name ?? 'No role'}</p>
          </div>
        )}
        <button
          onClick={logout}
          title={isCollapsed ? 'Log Out' : undefined}
          className={`flex w-full items-center gap-3 rounded-md py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive ${
            isCollapsed ? 'justify-center px-2' : 'px-2'
          }`}
        >
          <LogOut size={16} className="shrink-0" />
          {!isCollapsed && 'Log Out'}
        </button>
      </div>
    </aside>
  )
}

function SidebarLink({
  item,
  isCollapsed,
}: {
  item: { to: string; label: string; icon: typeof LayoutDashboard }
  isCollapsed: boolean
}) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      title={isCollapsed ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-md py-2 text-sm font-medium transition-colors ${
          isCollapsed ? 'justify-center px-2' : 'pl-2 pr-3'
        } ${
          isActive
            ? 'bg-brand/10 text-brand ring-1 ring-brand/20'
            : 'text-muted-foreground hover:bg-surface hover:text-foreground'
        }`
      }
    >
      <Icon size={16} className="shrink-0" />
      {!isCollapsed && item.label}
    </NavLink>
  )
}

export default Sidebar