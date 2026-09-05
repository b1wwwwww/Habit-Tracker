import { Habit, HabitLog, User } from '@prisma/client'

export type { Habit, HabitLog, User }

export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  todayLog?: HabitLog | null
  isDueToday?: boolean
  currentStreak?: number
  bestStreak?: number
}

export type HabitWithStatus = Habit & {
  todayLog?: HabitLog | null
  isDueToday?: boolean
  currentStreak?: number
  bestStreak?: number
}

export interface DashboardData {
  habits: HabitWithStatus[]
  summary: {
    completed: number
    total: number
    progress: number
  }
}

export interface StreakData {
  habitId: string
  title: string
  currentStreak: number
  bestStreak: number
  totalCompletions: number
}

export interface HeatmapData {
  heatmap: Record<string, number>
  year: number
}

export interface ApiResponse<T = unknown> {
  data?: T
  error?: string
  message?: string
  details?: unknown
}

export interface SessionUser {
  userId: string
  email: string
  name?: string
}