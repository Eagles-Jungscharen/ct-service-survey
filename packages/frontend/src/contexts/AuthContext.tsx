import { useAuth, AuthContextProps } from 'react-oidc-context'

// Re-export Auth-Context für einfachen Zugriff
export const useAuthContext = (): AuthContextProps => {
  return useAuth()
}

// User-Info aus Claims extrahieren
export interface UserInfo {
  userId: string
  displayName: string
  isAdmin: boolean
}

export function useUserInfo(): UserInfo | null {
  const auth = useAuth()
  
  if (!auth.isAuthenticated || !auth.user) {
    return null
  }

  // Claims aus Token extrahieren
  const userId = auth.user.profile.sub || 
                 auth.user.profile.person_id as string || 
                 auth.user.profile.nameidentifier as string || ''
  
  const displayName = auth.user.profile.name as string || 
                      auth.user.profile.preferred_username as string || 
                      'Unbekannt'
  
  // Admin-Status aus Groups-Claim prüfen
  const groups = auth.user.profile.groups as string[] || []
  const adminGroupId = import.meta.env.VITE_CHURCHTOOL_ADMIN_GROUP_ID || ''
  const isAdmin = adminGroupId ? groups.includes(adminGroupId) : false

  return {
    userId,
    displayName,
    isAdmin,
  }
}

// Hook für geschützte Routen
export function useRequireAuth() {
  const auth = useAuth()
  
  if (!auth.isAuthenticated) {
    auth.signinRedirect()
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
