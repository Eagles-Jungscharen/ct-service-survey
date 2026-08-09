import { apiClient } from './client'
import type { ResponseDto, SubmitResponsesRequest } from '@ct-service-survey/shared'

export const responsesApi = {
  // Eigene Antworten für eine Umfrage abrufen
  getMyResponses: (surveyId: string, token: string) =>
    apiClient.get<ResponseDto[]>(`/surveys/${surveyId}/responses/me`, token),

  // Alle Antworten für eine Umfrage abrufen (Admin)
  getAllResponses: (surveyId: string, token: string) =>
    apiClient.get<ResponseDto[]>(`/surveys/${surveyId}/responses`, token),

  // Antworten absenden
  submit: (data: SubmitResponsesRequest, token: string) =>
    apiClient.post<void>('/responses', token, data),
}
