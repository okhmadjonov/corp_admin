import type { NamedItem, Tag } from './clothes'

export interface ClothesBrief {
  id: number
  name: string
  slug: string
}

export type FileKind = 'preview' | 'download'
export type FileType = 'image' | 'pdf'

export interface PatternFile {
  id: number
  url: string
  kind: FileKind
  file_type: FileType
  sort_order: number
  is_main: boolean
}

export interface Pattern {
  id: number
  name: string
  slug: string
  description: string | null
  brand: string | null
  material: string | null
  price: string
  is_active: boolean
  views_count: number
  created_at: string
  gender: NamedItem
  season: NamedItem
  tags: Tag[]
  files: PatternFile[]
  clothes: ClothesBrief[]
}

export interface PatternInput {
  name: string
  description: string | null
  brand: string | null
  material: string | null
  price: string
  is_active: boolean
  gender_id: number
  season_id: number
  tag_ids: number[]
  clothes_ids: number[]
}

export interface FileInput {
  url: string
  kind: FileKind
  file_type: FileType
  sort_order: number
  is_main: boolean
}