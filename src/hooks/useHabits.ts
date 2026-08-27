'use client'

import { useState, useCallback } from 'react'
import { Habit, HabitLog } from '@/types'
import { useApi } from './useApi'

interface UseHabitsReturn {
  habits: (Habit & { todayLog?: HabitLog | null })[]
  loading: boolean
  error: string | null
  fetchHabits: () => Promise<void>
  createHabit: (data: HabitInput) => Promise<Habit>
  updateHabit: (id: string, data: HabitInput) => Promise<Habit>
  deleteHabit: (id: string) => Promise<void>
  checkIn: (habitId: string, value: number) => Promise<HabitLog>
  undoCheckIn: (habitId: string) => Promise<void>
}

export interface HabitInput {
  title: string
  description?: string
  category: string
  targetType: 'BOOLEAN' | 'NUMERIC'
  targetValue: number
  frequencyType: 'DAILY' | 'CUSTOM_DAYS' | 'WEEKLY'
  frequencyDays: string[]
  reminderTime?: string | null
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<(Habit & { todayLog?: HabitLog | null })[]>([])

  const { execute: fetchExecute, loading: fetchLoading, error: fetchError } = useApi<{ habits: (Habit & { todayLog?: HabitLog | null })[] }>({
    onSuccess: (data) => {
      setHabits(data.habits)
    },
  })

  const { execute: createExecute, loading: createLoading } = useApi<{ habit: Habit }>()
  const { execute: updateExecute, loading: updateLoading } = useApi<{ habit: Habit }>()
  const { execute: deleteExecute, loading: deleteLoading } = useApi<{ message: string }>()
  const { execute: checkInExecute, loading: checkInLoading } = useApi<{ log: HabitLog }>()
  const { execute: undoExecute, loading: undoLoading } = useApi<{ message: string }>()

  const extractHabit = (result: { habit: Habit }) => result.habit
  const extractLog = (result: { log: HabitLog }) => result.log

  const fetchHabits = useCallback(async () => {
    await fetchExecute(async () => {
      const res = await fetch('/api/habits')
      if (!res.ok) throw new Error('Gagal mengambil habit')
      return res.json()
    })
  }, [fetchExecute])

  const createHabit = useCallback(
    async (data: HabitInput) => {
      const result = await createExecute(async () => {
        const res = await fetch('/api/habits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal membuat habit')
        }
        return res.json()
      })
      return extractHabit(result)
    },
    [createExecute]
  )

  const updateHabit = useCallback(
    async (id: string, data: HabitInput) => {
      const result = await updateExecute(async () => {
        const res = await fetch(`/api/habits/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal memperbarui habit')
        }
        return res.json()
      })
      return extractHabit(result)
    },
    [updateExecute]
  )

  const deleteHabit = useCallback(
    async (id: string) => {
      await deleteExecute(async () => {
        const res = await fetch(`/api/habits/${id}`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal menghapus habit')
        }
        return res.json()
      })
    },
    [deleteExecute]
  )

  const checkIn = useCallback(
    async (habitId: string, value: number) => {
      const result = await checkInExecute(async () => {
        const res = await fetch(`/api/habits/${habitId}/check-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentValue: value }),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal check-in')
        }
        return res.json()
      })
      return extractLog(result)
    },
    [checkInExecute]
  )

  const undoCheckIn = useCallback(
    async (habitId: string) => {
      await undoExecute(async () => {
        const res = await fetch(`/api/habits/${habitId}/check-in`, { method: 'DELETE' })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error || 'Gagal membatalkan check-in')
        }
        return res.json()
      })
    },
    [undoExecute]
  )

  const loading = fetchLoading || createLoading || updateLoading || deleteLoading || checkInLoading || undoLoading
  const error = fetchError

  return {
    habits,
    loading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    checkIn,
    undoCheckIn,
  }
}