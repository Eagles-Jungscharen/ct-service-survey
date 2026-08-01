import { useQuery } from '@tanstack/react-query'
import { useAuth } from 'react-oidc-context'
import { meApi } from '../services/api'

// Query Key
const meKeys = {
  me: ['me'] as const,
}

// Benutzerinformationen vom Backend abrufen
export function useMe() {
  const auth = useAuth()

  return useQuery({
    queryKey: meKeys.me,
    queryFn: meApi.getMe,
    // Nur abrufen wenn authentifiziert
    enabled: auth.isAuthenticated,
    // 5 Minuten Cache (synchron mit Backend-Cache)
    staleTime: 5 * 60 * 1000,
    // Bei Fehler nicht automatisch wiederholen
    retry: false,
  })
}
