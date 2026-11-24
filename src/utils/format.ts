export function formatPrice(value: string | number): string {
  return `${Number(value).toLocaleString('ru-RU')} so'm`
}