import type { ActivateSurveyRequest, CreateServiceDateRequest, CreateSurveyRequest, FetchEventsRequest, FetchEventsResponse, ServiceDateDto, SurveyDto, UpdateSurveyRequest, } from '@ct-service-survey/shared'

import { apiClient } from './client'

export const surveysApi = {
  // Alle Umfragen abrufen
  getAll: (token: string) => apiClient.get<SurveyDto[]>('/api/surveys', token),

  // Nur eingeladene Umfragen abrufen (invitedPersonIds enthält userId)
  getInvited: (token: string) => apiClient.get<SurveyDto[]>('/api/surveys/invited', token),

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

  // Umfrage aktivieren
  activate: (surveyId: string, data: ActivateSurveyRequest, token: string) =>
    apiClient.post<SurveyDto>(`/api/surveys/${surveyId}/activate`, token, data),

  // Umfrage schließen
  close: (surveyId: string, token: string) =>
    apiClient.post<SurveyDto>(`/api/surveys/${surveyId}/close`, token),

  // Umfrage anhand TAG abrufen
  getByTag: (tag: string, token: string) => apiClient.get<SurveyDto>(`/api/surveys/by-tag/${tag}`, token),
}
