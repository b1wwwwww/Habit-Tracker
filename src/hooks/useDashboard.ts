'use client'

import { useState, useCallback } from 'react'
import { DashboardData } from '@/types'
import { useApi } from './useApi'

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)

  const { execute, loading, error } = useApi({
    onSuccess: (result: DashboardData) => {
      setData(result)
    },
  })

  const fetchDashboard = useCallback(async () => {
    await execute(async () => {
      const res = await fetch('/api/habits/dashboard/today')
      if (!res.ok) throw new Error('Gagal mengambil dashboard')
      return res.json()
    })
  }, [execute])

  return { data, loading, error, fetchDashboard }
}