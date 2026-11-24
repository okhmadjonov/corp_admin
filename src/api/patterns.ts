import { api } from './client'
import type { Page } from '@/types/common'
import type { FileInput, Pattern, PatternFile, PatternInput } from '@/types/patterns'

export interface PatternListParams {
  limit: number
  offset: number
  q?: string
}

export const patternsApi = {
  list: (params: PatternListParams) =>
    api.get<Page<Pattern>>('/admin/patterns', { params }).then((r) => r.data),
  get: (id: number) => api.get<Pattern>(`/admin/patterns/${id}`).then((r) => r.data),
  create: (data: PatternInput) => api.post<Pattern>('/admin/patterns', data).then((r) => r.data),
  update: (id: number, data: PatternInput) =>
    api.put<Pattern>(`/admin/patterns/${id}`, data).then((r) => r.data),
  remove: (id: number) => api.delete(`/admin/patterns/${id}`),

  addFile: (id: number, data: FileInput) =>
    api.post<PatternFile>(`/admin/patterns/${id}/files`, data).then((r) => r.data),
  updateFile: (id: number, fileId: number, data: FileInput) =>
    api.put<PatternFile>(`/admin/patterns/${id}/files/${fileId}`, data).then((r) => r.data),
  removeFile: (id: number, fileId: number) =>
    api.delete(`/admin/patterns/${id}/files/${fileId}`),
  // yopiq PDF: token bilan olinadi, /media orqali ochiq emas
  fileContent: (id: number, fileId: number) =>
    api
      .get<Blob>(`/admin/patterns/${id}/files/${fileId}/content`, { responseType: 'blob' })
      .then((r) => r.data),
}