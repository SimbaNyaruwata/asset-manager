export type UserRole = 'admin' | 'user'

export interface User {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Session {
  user: User
  access_token: string
}