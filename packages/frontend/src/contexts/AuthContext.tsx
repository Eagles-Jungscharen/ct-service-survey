import type { MeDto } from '@ct-service-survey/shared'
import { useAuth, AuthContextProps } from 'react-oidc-context'

import { useMe } from '../hooks/useMe'

// Re-export Auth-Context für einfachen Zugriff
export const useAuthContext = (): AuthContextProps => {
  return useAuth()
}

// User-Info-Interface (kompatibel mit MeDto)
export type UserInfo = MeDto

export function useUserInfo(): UserInfo | null {
  const auth = useAuth()
  const { data: meDto, isLoading, error } = useMe()

  // Nicht authentifiziert
  if (!auth.isAuthenticated) {
    return null
  }

  // Lädt noch oder Fehler aufgetreten
  if (isLoading || error) {
    return null
  }

  // MeDto vom Backend zurückgeben
  return meDto ?? null
}

// Hook für geschützte Routen
export function useRequireAuth() {
  const auth = useAuth()

  if (!auth.isAuthenticated) {
    void auth.signinRedirect()
  }

  return auth.isAuthenticated
}

// Hook für Admin-Routen
export function useRequireAdmin() {
  const userInfo = useUserInfo()
  const isAdmin = userInfo?.isAdmin ?? false

  if (!isAdmin) {
    throw new Error('Admin-Berechtigung erforderlich')
  }

  return isAdmin
}
