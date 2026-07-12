const API_BASE_URL = 'http://127.0.0.1:8000/api'

function getToken(): string | null {
  return localStorage.getItem('auth_token')
}

export async function apiClient(endpoint: string, options: RequestInit = {}) {
  const token = getToken()

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    throw new Error(errorBody?.message || `Request failed: ${response.status}`)
  }

  if (response.status === 204) return null

  return response.json()
}