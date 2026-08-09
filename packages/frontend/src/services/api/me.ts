import { apiClient } from './client'
import type { MeDto } from '@ct-service-survey/shared'

export const meApi = {
  // Aktuelle Benutzerinformationen abrufen
  getMe: async (token:string): Promise<MeDto> => {
    return apiClient.get<MeDto>('/api/me', token)
  },
}
