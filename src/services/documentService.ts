const API_BASE_URL = 'http://127.0.0.1:8000/api'

interface CreateDocumentInput {
  document_type: string
  expiry_date: string
  attachment?: File | null
}

type DocumentableResource = 'trucks' | 'staff' | 'drivers' | 'trailers'

export async function createDocument(
  resource: DocumentableResource,
  resourceId: number,
  input: CreateDocumentInput
) {
  const token = localStorage.getItem('auth_token')

  const formData = new FormData()
  formData.append('document_type', input.document_type)
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