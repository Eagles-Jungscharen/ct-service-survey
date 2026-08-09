import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { responsesApi } from '../services/api'
import type { SubmitResponsesRequest } from '@ct-service-survey/shared'
import { useAppAuth } from './useAppAuthContext';

// Query Keys
const responseKeys = {
  myResponses: (surveyId: string) => ['responses', 'me', surveyId] as const,
  allResponses: (surveyId: string) => ['responses', 'all', surveyId] as const,
}

// Eigene Antworten für eine Umfrage abrufen
export function useMyResponses(surveyId: string) {
  const auth = useAppAuth();
  return useQuery({
    queryKey: responseKeys.myResponses(surveyId),
    queryFn: () => responsesApi.getMyResponses(surveyId, auth.token!),
    enabled: !!surveyId,
  })
}

// Alle Antworten für eine Umfrage abrufen (Admin)
export function useAllResponses(surveyId: string) {
  const auth = useAppAuth();
  return useQuery({
    queryKey: responseKeys.allResponses(surveyId),
    queryFn: () => responsesApi.getAllResponses(surveyId, auth.token!),
    enabled: !!surveyId,
  })
}

// Antworten absenden
export function useSubmitResponses() {
  const queryClient = useQueryClient()
  const auth = useAppAuth();
  
  return useMutation({
    mutationFn: (data: SubmitResponsesRequest) => responsesApi.submit(data, auth.token! ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: responseKeys.myResponses(variables.surveyId) 
      })
      queryClient.invalidateQueries({ 
        queryKey: responseKeys.allResponses(variables.surveyId) 
      })
    },
  })
}
