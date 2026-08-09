import { GroupDto } from '@ct-service-survey/shared';
import { createContext } from 'react';

export interface AppAuthContextValue {
  isAuthenticated: boolean
  isLoading: boolean
  isAdmin: boolean
  groups: GroupDto[]
  displayName: string
  userId: string
  token: string | null
  login: () => void
  logout: () => void
}

export const AppAuthContext = createContext<AppAuthContextValue | null>(null);