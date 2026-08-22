import type {
  MyAssignmentDto,
  AssignmentDto,
  SubmitAssignmentsRequest,
} from '@ct-service-survey/shared'

import { apiClient } from './client'

export const assignmentsApi = {
  // Eigene Einteilungen abrufen
  getMyAssignments: (token: string) => apiClient.get<MyAssignmentDto[]>('/api/assignments/me', token),

  // Alle Einteilungen für eine Umfrage abrufen (Admin)
  getAssignmentsForSurvey: (surveyId: string, token: string) =>
    apiClient.get<AssignmentDto[]>(`/api/surveys/${surveyId}/assignments`, token),

  // Einteilungen vornehmen (Admin)
  submit: (data: SubmitAssignmentsRequest, token: string) =>
    apiClient.post<void>('/api/assignments', token, data),
}
