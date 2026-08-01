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
  getAll: () => apiClient.get<SurveyDto[]>('/surveys'),

  // Einzelne Umfrage abrufen
  getById: (id: string) => apiClient.get<SurveyDto>(`/surveys/${id}`),

  // Umfrage erstellen
  create: (data: CreateSurveyRequest) =>
    apiClient.post<SurveyDto>('/surveys', data),

  // Umfrage aktualisieren
  update: (id: string, data: UpdateSurveyRequest) =>
    apiClient.put<SurveyDto>(`/surveys/${id}`, data),

  // Umfrage löschen
  delete: (id: string) => apiClient.delete<void>(`/surveys/${id}`),

  // ServiceDate hinzufügen
  addServiceDate: (surveyId: string, data: CreateServiceDateRequest) =>
    apiClient.post<ServiceDateDto>(`/surveys/${surveyId}/servicedates`, data),

  // ServiceDate löschen
  deleteServiceDate: (surveyId: string, serviceDateId: string) =>
    apiClient.delete<void>(`/surveys/${surveyId}/servicedates/${serviceDateId}`),
}
