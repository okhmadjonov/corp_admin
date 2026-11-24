import { api } from './client'
import type { RoleName } from '@/types/auth'
import type { AdminUser, Page, UserCreate, UserUpdate } from '@/types/users'

export interface UsersParams {
  limit: number
  offset: number
  q?: string
  role?: RoleName
}

export const usersApi = {
  list: (params: UsersParams) =>
    api.get<Page<AdminUser>>('/admin/users', { params }).then((r) => r.data),
  create: (data: UserCreate) => api.post<AdminUser>('/admin/users', data).then((r) => r.data),
  update: (id: number, data: UserUpdate) =>
    api.put<AdminUser>(`/admin/users/${id}`, data).then((r) => r.data),
  resetPassword: (id: number, password: string) =>
    api.post(`/admin/users/${id}/reset-password`, { password }),
  remove: (id: number) => api.delete(`/admin/users/${id}`),
}