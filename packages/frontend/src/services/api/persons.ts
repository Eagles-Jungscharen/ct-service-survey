import type { PersonDto } from '@ct-service-survey/shared'

import { apiClient } from './client'

export const personsApi = {
  // Personen in ChurchTools suchen
  search: (query: string, token: string) =>
    apiClient.get<PersonDto[]>(`/api/persons/search?q=${encodeURIComponent(query)}`, token),
}
