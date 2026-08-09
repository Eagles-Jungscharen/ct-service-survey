import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentsApi } from '../services/api'
import type { SubmitAssignmentsRequest } from '@ct-service-survey/shared'
import { useAppAuth } from './useAppAuthContext';

// Query Keys
const assignmentKeys = {
  myAssignments: ['assignments', 'me'] as const,
  surveyAssignments: (surveyId: string) => ['assignments', 'survey', surveyId] as const,
}

// Eigene Einteilungen abrufen
export function useMyAssignments() {
  const auth = useAppAuth();
  return useQuery({
    queryKey: assignmentKeys.myAssignments,
    queryFn: () => assignmentsApi.getMyAssignments(auth.token!),
  })
}

// Alle Einteilungen für eine Umfrage abrufen (Admin)
export function useSurveyAssignments(surveyId: string) {
  const auth = useAppAuth();
  return useQuery({
    queryKey: assignmentKeys.surveyAssignments(surveyId),
    queryFn: () => assignmentsApi.getAssignmentsForSurvey(surveyId, auth.token!),
    enabled: !!surveyId,
  })
}

// Einteilungen vornehmen (Admin)
export function useSubmitAssignments() {
  const queryClient = useQueryClient()
  const auth = useAppAuth();
  return useMutation({
    mutationFn: (data: SubmitAssignmentsRequest) => assignmentsApi.submit(data, auth.token!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.myAssignments })
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.surveyAssignments(variables.surveyId) 
      })
    },
  })
}
