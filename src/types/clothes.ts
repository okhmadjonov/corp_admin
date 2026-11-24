export interface NamedItem {
  id: number
  name: string
}

export interface Tag extends NamedItem {
  slug: string
}

export interface ClothesVariant {
  id: number
  size: string
  color: string
  price: string
  stock_quantity: number
  sku: string
}

export interface ClothesImage {
  id: number
  url: string
  sort_order: number
  is_main: boolean
}

export interface PatternBrief {
  id: number
  name: string
  slug: string
}

export interface Clothes {
  id: number
  name: string
  slug: string
  description: string | null
  brand: string | null
  material: string | null
  is_active: boolean
  views_count: number
  created_at: string
  gender: NamedItem
  season: NamedItem
  tags: Tag[]
  variants: ClothesVariant[]
  images: ClothesImage[]
  patterns: PatternBrief[]
}

export interface ClothesInput {
  name: string
  description: string | null
  brand: string | null
  material: string | null
  is_active: boolean
  gender_id: number
  season_id: number
  tag_ids: number[]
  pattern_ids: number[]
}