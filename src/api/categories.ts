import { api } from './client'

export type CategoryKind = 'genders' | 'seasons' | 'tags'

export interface Category {
  id: number
  name: string
  slug?: string
}

export const categoriesApi = {
  list: (kind: CategoryKind) => api.get<Category[]>(`/${kind}`).then((r) => r.data),
  create: (kind: CategoryKind, name: string) =>
    api.post<Category>(`/${kind}`, { name }).then((r) => r.data),
  update: (kind: CategoryKind, id: number, name: string) =>
    api.put<Category>(`/${kind}/${id}`, { name }).then((r) => r.data),
  remove: (kind: CategoryKind, id: number) => api.delete(`/${kind}/${id}`),
}