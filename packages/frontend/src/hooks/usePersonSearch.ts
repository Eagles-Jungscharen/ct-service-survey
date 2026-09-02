import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'

import { useAppAuth } from './useAppAuthContext'
import { personsApi } from '../services/api'

// Query Keys
const personsKeys = {
  search: (query: string) => ['persons', 'search', query] as const,
  byId: (personId: string) => ['persons', 'byId', personId] as const,
}

// Personen in ChurchTools suchen mit Debouncing
export const usePersonSearch = (query: string, debounceMs = 300) => {
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

// Einzelne Person in ChurchTools anhand der ID abrufen
export const usePersonById = (personId: string) => {
  const auth = useAppAuth()

  return useQuery({
    queryKey: personsKeys.byId(personId),
    queryFn: () => personsApi.byId(personId, auth.token!),
    enabled: !!auth.token && !!personId,
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
  })
}