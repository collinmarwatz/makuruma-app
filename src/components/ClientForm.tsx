import { useState, type FormEvent } from 'react'
import { createClient, updateClient } from '../services/clientService'
import type { Client } from '../types/partner'
import { Loader2 } from 'lucide-react'

interface ClientFormProps {
  client?: Client | null
  onSaved: () => void
}

function ClientForm({ client, onSaved }: ClientFormProps) {
  const isEditMode = !!client

  const [companyName, setCompanyName] = useState(client?.company_name ?? '')
  const [shortCode, setShortCode] = useState(client?.short_code ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allowsAdvanceInvoice, setAllowsAdvanceInvoice] = useState(client?.allows_advance_invoice ?? false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const payload = {
        company_name: companyName,
        short_code: shortCode.toUpperCase(),
        email,
        phone,
        allows_advance_invoice: allowsAdvanceInvoice,

      }
      if (isEditMode) {
        await updateClient(client.id, payload)
      } else {
        await createClient(payload)
      }
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm rounded-lg p-3 mb-4 ring-1 ring-destructive/20">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Company Name</label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Short Code</label>
          <input
            type="text"
            value={shortCode}
            onChange={(e) => setShortCode(e.target.value.toUpperCase())}
            maxLength={5}
            placeholder="e.g. ALI"
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground uppercase focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <p className="text-xs text-muted-foreground mt-1">Used to generate Booking IDs — must be unique</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Phone (Key Personnel)</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full bg-secondary ring-1 ring-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
        <div className="mb-6">
  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
    <input
      type="checkbox"
      checked={allowsAdvanceInvoice}
      onChange={(e) => setAllowsAdvanceInvoice(e.target.checked)}
      className="cursor-pointer"
    />
    Allow Advance Invoices for this client
  </label>
  <p className="text-xs text-muted-foreground mt-1 ml-6">
    Only clients with this enabled can be issued an Advance-type invoice.
  </p>
</div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-brand text-brand-foreground py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? 'Saving...' : isEditMode ? 'Update Client' : 'Save Client'}
      </button>
    </form>
  )
}

export default ClientForm