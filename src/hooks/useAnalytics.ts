'use client'

import { useState, useCallback } from 'react'
import { StreakData, HeatmapData } from '@/types'
import { useApi } from './useApi'

export function useStreaks() {
  const [streaks, setStreaks] = useState<StreakData[]>([])

  const { execute, loading, error } = useApi({
    onSuccess: (data: { streaks: StreakData[] }) => {
      setStreaks(data.streaks)
    },
  })

  const fetchStreaks = useCallback(async () => {
    await execute(async () => {
      const res = await fetch('/api/analytics/streaks')
      if (!res.ok) throw new Error('Gagal mengambil data streak')
      return res.json()
    })
  }, [execute])

  return { streaks, loading, error, fetchStreaks }
}

export function useHeatmap(initialYear?: number) {
  const [heatmap, setHeatmap] = useState<Record<string, number>>({})
  const [year, setYear] = useState(initialYear || new Date().getFullYear())

  const { execute, loading, error } = useApi({
    onSuccess: (data: HeatmapData) => {
      setHeatmap(data.heatmap)
      setYear(data.year)
    },
  })

  const fetchHeatmap = useCallback(
    async (targetYear?: number) => {
      const y = targetYear || year
      await execute(async () => {
        const res = await fetch(`/api/analytics/heatmap?year=${y}`)
        if (!res.ok) throw new Error('Gagal mengambil data heatmap')
        return res.json()
      })
    },
    [execute, year]
  )

  const changeYear = useCallback(
    async (newYear: number) => {
      setYear(newYear)
      await fetchHeatmap(newYear)
    },
    [fetchHeatmap]
  )

  return { heatmap, year, loading, error, fetchHeatmap, changeYear }
}