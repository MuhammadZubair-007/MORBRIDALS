import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPKR(amount: number | string) {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(n)) return 'PKR 0'
  return `PKR ${n.toLocaleString('en-PK')}`
}
