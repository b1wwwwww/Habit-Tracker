import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = new Date(date)
  return d.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

export function formatTime(time: string): string {
  return time
}

export function getDayName(date: Date): string {
  return date.toLocaleDateString('id-ID', { weekday: 'short' }).toUpperCase()
}

export const CATEGORIES = [
  'Kesehatan',
  'Produktivitas',
  'Keuangan',
  'Kebugaran',
  'Pendidikan',
  'Hobi',
  'Lainnya',
] as const

export const FREQUENCY_OPTIONS = [
  { value: 'DAILY', label: 'Harian' },
  { value: 'CUSTOM_DAYS', label: 'Hari Tertentu' },
  { value: 'WEEKLY', label: 'Mingguan' },
] as const

export const TARGET_TYPES = [
  { value: 'BOOLEAN', label: 'Selesai/Belum (Ya/Tidak)' },
  { value: 'NUMERIC', label: 'Numerik (Angka)' },
] as const