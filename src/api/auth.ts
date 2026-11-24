import { api } from './client'
import type { Tokens, User } from '@/types/auth'

export const authApi = {
  login: (login: string, password: string) =>
    api.post<Tokens>('/auth/login', { login, password }).then((r) => r.data),

  me: () => api.get<User>('/auth/me').then((r) => r.data),

  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }),
}