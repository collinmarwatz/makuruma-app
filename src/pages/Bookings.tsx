import { useEffect, useState } from 'react'
import type { Booking } from '../types/booking'
import { fetchBookings, deleteBooking, downloadBookingAccessList } from '../services/bookingService'
import BookingForm from '../components/BookingForm'
import BookingTable from '../components/BookingTable'
import Modal from '../components/ui/Modal'
import TableSkeleton from '../components/ui/TableSkeleton'
import { Plus } from 'lucide-react'

function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reloadTrigger, setReloadTrigger] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [newDirection, setNewDirection] = useState<'go' | 'return'>('go')

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!cancelled) { setLoading(true); setError(null) }
      try {
        const data = await fetchBookings()
        if (!cancelled) setBookings(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load bookings')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [reloadTrigger])

  function refresh() { setReloadTrigger((prev) => prev + 1) }

  function openAddModal(direction: 'go' | 'return') {
    setNewDirection(direction)
    setEditingBooking(null)
    setIsModalOpen(true)
  }

  function openEditModal(booking: Booking) {
    setEditingBooking(booking)
    setIsModalOpen(true)
  }

  function handleSaved() { setIsModalOpen(false); refresh() }

  async function handleDelete(booking: Booking) {
    if (!window.confirm(`Delete booking ${booking.booking_number}?`)) return
    try {
      await deleteBooking(booking.id)
      refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete booking')
    }
  }

  async function handleDownload(booking: Booking) {
    try {
      await downloadBookingAccessList(booking)
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Download failed')
    }
  }

  if (error) return <p className="p-8 text-red-500">Error: {error}</p>

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bookings</h1>
        <div className="flex gap-2">
          <button onClick={() => openAddModal('go')} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            <Plus size={18} />
            New Go Booking
          </button>
          <button onClick={() => openAddModal('return')} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            <Plus size={18} />
            New Return Booking
          </button>
        </div>
      </div>

      {loading ? (
        <TableSkeleton columns={13} />
      ) : (
        <BookingTable bookings={bookings} onEdit={openEditModal} onDelete={handleDelete} onDownload={handleDownload} />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBooking ? `Edit Booking — ${editingBooking.booking_number}` : `New ${newDirection === 'go' ? 'Go' : 'Return'} Booking`}
      >
        <BookingForm booking={editingBooking} direction={newDirection} onSaved={handleSaved} />
      </Modal>
    </div>
  )
}

export default Bookings