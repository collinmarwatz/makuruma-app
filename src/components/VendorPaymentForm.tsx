import { useState, type FormEvent } from 'react'
import { createVendorPayment } from '../services/vendorPaymentService'
import { Loader2 } from 'lucide-react'

interface VendorPaymentFormProps {
  vendorId: number
  onSaved: () => void
}

function VendorPaymentForm({ vendorId, onSaved }: VendorPaymentFormProps) {
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!amount) {
      setError('Enter a payment amount')
      return
    }

    setIsSubmitting(true)
    try {
      await createVendorPayment({
        vendor_id: vendorId.toString(),
        amount,
        payment_date: paymentDate,
        description: description || undefined,
      })
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">{error}</div>}

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">Amount (TZS)</label>
        <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)}
          className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-foreground mb-1">Payment Date</label>
        <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)}
          className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground" />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Bank transfer for July fuel debt" className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
      </div>

      <button type="submit" disabled={isSubmitting}
        className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Recording...' : 'Record Payment'}
      </button>
    </form>
  )
}

export default VendorPaymentForm