import { api } from './client'
import type { Clothes, ClothesInput } from '@/types/clothes'

export interface ClothesListParams {
  limit: number
  offset: number
  q?: string
}

export const clothesApi = {
  list: (params: ClothesListParams) =>
    api.get<Clothes[]>('/admin/clothes', { params }).then((r) => r.data),
  get: (id: number) => api.get<Clothes>(`/admin/clothes/${id}`).then((r) => r.data),
  create: (data: ClothesInput) => api.post<Clothes>('/admin/clothes', data).then((r) => r.data),
  update: (id: number, data: ClothesInput) =>
    api.put<Clothes>(`/admin/clothes/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/admin/clothes/${id}`),
}