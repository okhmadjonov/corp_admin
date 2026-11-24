import { api } from './client'

export interface UploadResult {
  url: string
  file_type: 'image' | 'pdf'
  size: number
}

export const uploadsApi = {
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<UploadResult>('/admin/uploads', form).then((r) => r.data)
  },
}