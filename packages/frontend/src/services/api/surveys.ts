import type { CreateServiceDateRequest, CreateSurveyRequest, FetchEventsRequest, FetchEventsResponse, ServiceDateDto, SurveyDto, UpdateSurveyRequest, } from '@ct-service-survey/shared'

import { apiClient } from './client'

export const surveysApi = {
  // Alle Umfragen abrufen
  getAll: (token: string) => apiClient.get<SurveyDto[]>('/api/surveys', token),

  // Einzelne Umfrage abrufen
  getById: (id: string, token: string) => apiClient.get<SurveyDto>(`/api/surveys/${id}`, token),

  // Umfrage erstellen
  create: (data: CreateSurveyRequest, token: string) =>
    apiClient.post<SurveyDto>('/api/surveys', token, data),

  // Umfrage aktualisieren
  update: (id: string, data: UpdateSurveyRequest, token: string) =>
    apiClient.put<SurveyDto>(`/api/surveys/${id}`, token, data),

  // Umfrage löschen
  delete: (id: string, token: string) => apiClient.delete<void>(`/api/surveys/${id}`, token),

  // ServiceDate hinzufügen
  addServiceDate: (surveyId: string, data: CreateServiceDateRequest, token: string) =>
    apiClient.post<ServiceDateDto>(`/api/surveys/${surveyId}/servicedates`, token, data),

  // ServiceDate löschen
  deleteServiceDate: (surveyId: string, serviceDateId: string, token: string) =>
    apiClient.delete<void>(`/api/surveys/${surveyId}/servicedates/${serviceDateId}`, token),

  // Events aus ChurchTools abrufen (für Survey-Wizard)
  fetchEvents: (data: FetchEventsRequest, token: string) =>
    apiClient.post<FetchEventsResponse>('/api/surveys/fetch-events', token, data),
}
