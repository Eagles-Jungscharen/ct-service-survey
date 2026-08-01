import { apiClient } from './client'
import type { ResponseDto, SubmitResponsesRequest } from '@ct-service-survey/shared'

export const responsesApi = {
  // Eigene Antworten für eine Umfrage abrufen
  getMyResponses: (surveyId: string) =>
    apiClient.get<ResponseDto[]>(`/surveys/${surveyId}/responses/me`),

  // Alle Antworten für eine Umfrage abrufen (Admin)
  getAllResponses: (surveyId: string) =>
    apiClient.get<ResponseDto[]>(`/surveys/${surveyId}/responses`),

  // Antworten absenden
  submit: (data: SubmitResponsesRequest) =>
    apiClient.post<void>('/responses', data),
}
