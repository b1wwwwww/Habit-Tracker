'use client'

import { useState, useCallback, useRef } from 'react'

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void
  onError?: (error: string) => void
}

export function useApi<T = unknown>(options: UseApiOptions<T> = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const optionsRef = useRef(options)
  optionsRef.current = options

  const execute = useCallback(
    async (apiCall: () => Promise<T>) => {
      setLoading(true)
      setError(null)
      try {
        const result = await apiCall()
        setData(result)
        optionsRef.current.onSuccess?.(result)
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Terjadi kesalahan'
        setError(errorMessage)
        optionsRef.current.onError?.(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return { execute, loading, error, data, reset }
}