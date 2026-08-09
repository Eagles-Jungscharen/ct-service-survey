import { apiClient } from './client'
import type {
  MyAssignmentDto,
  AssignmentDto,
  SubmitAssignmentsRequest,
} from '@ct-service-survey/shared'

export const assignmentsApi = {
  // Eigene Einteilungen abrufen
  getMyAssignments: (token: string) => apiClient.get<MyAssignmentDto[]>('/assignments/me', token),

  // Alle Einteilungen für eine Umfrage abrufen (Admin)
  getAssignmentsForSurvey: (surveyId: string, token: string) =>
    apiClient.get<AssignmentDto[]>(`/surveys/${surveyId}/assignments`, token),

  // Einteilungen vornehmen (Admin)
  submit: (data: SubmitAssignmentsRequest, token: string) =>
    apiClient.post<void>('/assignments', token, data),
}
