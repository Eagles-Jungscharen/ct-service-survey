import type { ServiceDto } from '@ct-service-survey/shared'

import { apiClient } from './client'

export const servicesApi = {
  // Alle verfügbaren Services (Dienste) aus ChurchTools abrufen
  getAll: (token: string) => apiClient.get<ServiceDto[]>('/api/services', token),
}
