import { apiClient } from './client'
import type {
  SurveyDto,
  CreateSurveyRequest,
  UpdateSurveyRequest,
  ServiceDateDto,
  CreateServiceDateRequest,
} from '@ct-service-survey/shared'

export const surveysApi = {
  // Alle Umfragen abrufen
  getAll: (token: string) => apiClient.get<SurveyDto[]>('/surveys', token),

  // Einzelne Umfrage abrufen
  getById: (id: string, token: string) => apiClient.get<SurveyDto>(`/surveys/${id}`, token),

  // Umfrage erstellen
  create: (data: CreateSurveyRequest, token: string) =>
    apiClient.post<SurveyDto>('/surveys', token, data),

  // Umfrage aktualisieren
  update: (id: string, data: UpdateSurveyRequest, token: string) =>
    apiClient.put<SurveyDto>(`/surveys/${id}`, token, data),

  // Umfrage löschen
  delete: (id: string, token: string) => apiClient.delete<void>(`/surveys/${id}`, token),

  // ServiceDate hinzufügen
  addServiceDate: (surveyId: string, data: CreateServiceDateRequest, token: string) =>
    apiClient.post<ServiceDateDto>(`/surveys/${surveyId}/servicedates`, token, data),

  // ServiceDate löschen
  deleteServiceDate: (surveyId: string, serviceDateId: string, token: string) =>
    apiClient.delete<void>(`/surveys/${surveyId}/servicedates/${serviceDateId}`, token),
}
