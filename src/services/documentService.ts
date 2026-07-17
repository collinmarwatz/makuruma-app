const API_BASE_URL = 'http://127.0.0.1:8000/api'

type DocumentableResource = 'trucks' | 'staff' | 'drivers' | 'trailers'

interface CreateDocumentInput {
  document_type: string
  number?: string
  expiry_date: string
  attachment?: File | null
}

export async function createDocument(
  resource: DocumentableResource,
  resourceId: number,
  input: CreateDocumentInput
) {
  const token = localStorage.getItem('auth_token')

  const formData = new FormData()
  formData.append('document_type', input.document_type)
  if (input.number) {
    formData.append('number', input.number)
  }
  formData.append('expiry_date', input.expiry_date)
  if (input.attachment) {
    formData.append('attachment', input.attachment)
  }

  const response = await fetch(`${API_BASE_URL}/${resource}/${resourceId}/documents`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  if (!response.ok) {
    const err = await response.json().catch(() => null)
    throw new Error(err?.message || 'Failed to upload document')
  }

  return response.json()
}