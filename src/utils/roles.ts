import type { RoleName } from '@/types/auth'

export const ROLE_LABELS: Record<RoleName, string> = {
  super_admin: 'Super admin',
  operator: 'Operator',
  user: 'Foydalanuvchi',
}

export const ROLE_NAMES: RoleName[] = ['super_admin', 'operator', 'user']