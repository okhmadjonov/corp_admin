import type { Role, RoleName } from './auth'

export interface AdminUser {
  id: number
  login: string
  full_name: string
  role: Role
  created_at: string
}

export interface Page<T> {
  items: T[]
  total: number
  limit: number
  offset: number
}

export interface UserCreate {
  login: string
  password: string
  full_name: string
  role: RoleName
}

export interface UserUpdate {
  full_name: string
  role: RoleName
}