import { apiClient } from './client'
import type { ServiceDto } from '@ct-service-survey/shared'

export const servicesApi = {
  // Alle verfügbaren Services (Dienste) aus ChurchTools abrufen
  getAll: (token: string) => apiClient.get<ServiceDto[]>('/api/services', token),
}
