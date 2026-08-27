import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import { useAppAuth } from './useAppAuthContext'
import { personsApi } from '../services/api'

// Query Keys
const personsKeys = {
  search: (query: string) => ['persons', 'search', query] as const,
}

// Personen in ChurchTools suchen mit Debouncing
export function usePersonSearch(query: string, debounceMs: number = 300) {
  const auth = useAppAuth()
  const [debouncedQuery, setDebouncedQuery] = useState(query)

  // Debounce-Logik
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query)
    }, debounceMs)

    return () => {
      clearTimeout(handler)
    }
  }, [query, debounceMs])

  return useQuery({
    queryKey: personsKeys.search(debouncedQuery),
    queryFn: () => personsApi.search(debouncedQuery, auth.token!),
    enabled: !!auth.token && debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
  })
}
