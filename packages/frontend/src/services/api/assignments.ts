import { apiClient } from './client'
import type {
  MyAssignmentDto,
  AssignmentDto,
  SubmitAssignmentsRequest,
} from '@ct-service-survey/shared'

export const assignmentsApi = {
  // Eigene Einteilungen abrufen
  getMyAssignments: () => apiClient.get<MyAssignmentDto[]>('/assignments/me'),

  // Alle Einteilungen für eine Umfrage abrufen (Admin)
  getAssignmentsForSurvey: (surveyId: string) =>
    apiClient.get<AssignmentDto[]>(`/surveys/${surveyId}/assignments`),

  // Einteilungen vornehmen (Admin)
  submit: (data: SubmitAssignmentsRequest) =>
    apiClient.post<void>('/assignments', data),
}
