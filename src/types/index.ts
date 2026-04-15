export type UserRole = 'admin' | 'user'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: Profile | null
  loading: boolean
  isAuthenticated: boolean
}
