import { api } from './client'
import type {
  Clothes,
  ClothesImage,
  ClothesInput,
  ClothesVariant,
  ImageInput,
  VariantInput,
} from '@/types/clothes'

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

  addVariant: (id: number, data: VariantInput) =>
    api.post<ClothesVariant>(`/admin/clothes/${id}/variants`, data).then((r) => r.data),
  updateVariant: (id: number, variantId: number, data: VariantInput) =>
    api.put<ClothesVariant>(`/admin/clothes/${id}/variants/${variantId}`, data).then((r) => r.data),
  removeVariant: (id: number, variantId: number) =>
    api.delete(`/admin/clothes/${id}/variants/${variantId}`),

  addImage: (id: number, data: ImageInput) =>
    api.post<ClothesImage>(`/admin/clothes/${id}/images`, data).then((r) => r.data),
  updateImage: (id: number, imageId: number, data: ImageInput) =>
    api.put<ClothesImage>(`/admin/clothes/${id}/images/${imageId}`, data).then((r) => r.data),
  removeImage: (id: number, imageId: number) =>
    api.delete(`/admin/clothes/${id}/images/${imageId}`),
}