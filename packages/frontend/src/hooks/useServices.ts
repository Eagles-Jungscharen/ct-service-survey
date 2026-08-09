import { useQuery } from '@tanstack/react-query'
import { servicesApi } from '../services/api'
import { useAppAuth } from './useAppAuthContext'

// Query Keys
const servicesKeys = {
  all: ['services'] as const,
}

// Alle verfügbaren Services (Dienste) aus ChurchTools abrufen
export function useServices() {
  const auth = useAppAuth()
  
  return useQuery({
    queryKey: servicesKeys.all,
    queryFn: () => servicesApi.getAll(auth.token!),
    enabled: !!auth.token,
  })
}
