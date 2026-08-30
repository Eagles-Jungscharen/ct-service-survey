import type { ResponseDto, SubmitResponsesRequest, ResponseAnswerStateDto } from '@ct-service-survey/shared'

import { apiClient } from './client'

export const responsesApi = {
  // Eigene Antworten für eine Umfrage abrufen
  getMyResponses: (surveyId: string, token: string) =>
    apiClient.get<ResponseDto[]>(`/api/surveys/${surveyId}/responses/me`, token),

  // Alle Antworten für eine Umfrage abrufen (Admin)
  getAllResponses: (surveyId: string, token: string) =>
    apiClient.get<ResponseDto[]>(`/api/surveys/${surveyId}/responses`, token),

  // Antworten absenden
  submit: (data: SubmitResponsesRequest, token: string) =>
    apiClient.post<void>('/api/responses', token, data),

  //Anwortstatus
  getMyResponsesAnswerState: (surveyId: string, token: string) =>
    apiClient.get<ResponseAnswerStateDto>(`/api/surveys/${surveyId}/responses/me/state`, token),
}
