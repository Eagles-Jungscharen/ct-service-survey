import type { SubmitResponsesRequest } from '@ct-service-survey/shared'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useAppAuth } from './useAppAuthContext';
import { responsesApi } from '../services/api'

// Query Keys
const responseKeys = {
  myResponses: (surveyId: string) => ['responses', 'me', surveyId] as const,
  myResponsesAnswerState: (surveyId: string) => ['responses', 'me', 'state', surveyId] as const,
  allResponses: (surveyId: string) => ['responses', 'all', surveyId] as const,
}

// Eigene Antworten für eine Umfrage abrufen
export const useMyResponses = (surveyId: string) => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: responseKeys.myResponses(surveyId),
    queryFn: () => responsesApi.getMyResponses(surveyId, auth.token!),
    enabled: !!surveyId,
  })
}

// Eigene Antworten für den Antwortstatus einer Umfrage abrufen
export const useMyResponsesAnswerState = (surveyId: string) => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: responseKeys.myResponsesAnswerState(surveyId),
    queryFn: () => responsesApi.getMyResponsesAnswerState(surveyId, auth.token!),
    enabled: !!surveyId,
  })
}


// Alle Antworten für eine Umfrage abrufen (Admin)
export const useAllResponses = (surveyId: string) => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: responseKeys.allResponses(surveyId),
    queryFn: () => responsesApi.getAllResponses(surveyId, auth.token!),
    enabled: !!surveyId,
  })
}

// Antworten absenden
export const useSubmitResponses = () => {
  const queryClient = useQueryClient()
  const auth = useAppAuth();

  return useMutation({
    mutationFn: (data: SubmitResponsesRequest) => responsesApi.submit(data, auth.token!),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: responseKeys.myResponses(variables.surveyId)
      })
      void queryClient.invalidateQueries({
        queryKey: responseKeys.allResponses(variables.surveyId)
      })
      void queryClient.invalidateQueries({
        queryKey: responseKeys.myResponsesAnswerState(variables.surveyId)
      })
    },
  })
}
