import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assignmentsApi } from '../services/api'
import type { SubmitAssignmentsRequest } from '@ct-service-survey/shared'

// Query Keys
const assignmentKeys = {
  myAssignments: ['assignments', 'me'] as const,
  surveyAssignments: (surveyId: string) => ['assignments', 'survey', surveyId] as const,
}

// Eigene Einteilungen abrufen
export function useMyAssignments() {
  return useQuery({
    queryKey: assignmentKeys.myAssignments,
    queryFn: assignmentsApi.getMyAssignments,
  })
}

// Alle Einteilungen für eine Umfrage abrufen (Admin)
export function useSurveyAssignments(surveyId: string) {
  return useQuery({
    queryKey: assignmentKeys.surveyAssignments(surveyId),
    queryFn: () => assignmentsApi.getAssignmentsForSurvey(surveyId),
    enabled: !!surveyId,
  })
}

// Einteilungen vornehmen (Admin)
export function useSubmitAssignments() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: SubmitAssignmentsRequest) => assignmentsApi.submit(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.myAssignments })
      queryClient.invalidateQueries({ 
        queryKey: assignmentKeys.surveyAssignments(variables.surveyId) 
      })
    },
  })
}
