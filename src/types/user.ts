export interface Role {
  id: number
  name: string
  slug: string
}

export interface UserRecord {
  id: number
  name: string
  phone: string | null
  email: string
  status: 'active' | 'suspended'
  role: Role | null
}