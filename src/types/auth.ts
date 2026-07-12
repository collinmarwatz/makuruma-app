export interface Role {
  id: number
  name: string
  slug: string
}

export interface User {
  id: number
  name: string
  phone: string | null
  email: string
  role: Role | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}