import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import PageLoader from './components/ui/PageLoader'
import Staff from './pages/Staff'
import Drivers from './pages/Drivers'
import Clients from './pages/Clients'
import Vendors from './pages/Vendors'
import Bookings from './pages/Bookings'
import Tracking from './pages/Tracking'
import Expenses from './pages/Expenses'
import Invoices from './pages/Invoices'
import Assets from './pages/Assets'
import Trips from './pages/Trips'
import Reports from './pages/Reports'





function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()

  if (isLoading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
<Route path="/bookings" element={<Bookings />} />
<Route path="/trips" element={<Trips />} />
<Route path="/tracking" element={<Tracking />} />
<Route path="/assets" element={<Assets />} />
<Route path="/staff" element={<Staff />} />
<Route path="/drivers" element={<Drivers />} />
<Route path="/clients" element={<Clients />} />
<Route path="/vendors" element={<Vendors />} />
<Route path="/expenses" element={<Expenses />} />
<Route path="/invoices" element={<Invoices />} />
<Route path="/users" element={<Users />} />
<Route path="/reports" element={<Reports />} />

      </Route>
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App