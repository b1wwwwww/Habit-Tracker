import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  email: z.string().email('Email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  timezone: z.string().default('UTC'),
})

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export const habitSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi').max(100),
  description: z.string().max(500).optional(),
  category: z.string().min(1, 'Kategori wajib diisi'),
  targetType: z.enum(['BOOLEAN', 'NUMERIC']).default('BOOLEAN'),
  targetValue: z.number().int().positive().default(1),
  frequencyType: z.enum(['DAILY', 'CUSTOM_DAYS', 'WEEKLY']).default('DAILY'),
  frequencyDays: z.array(z.string()).default([]),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Format waktu HH:MM').optional().nullable(),
})

export const checkInSchema = z.object({
  currentValue: z.number().int().min(0).default(1),
  status: z.enum(['COMPLETED', 'PARTIAL', 'SKIPPED']).default('COMPLETED'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type HabitInput = z.infer<typeof habitSchema>
export type CheckInInput = z.infer<typeof checkInSchema>