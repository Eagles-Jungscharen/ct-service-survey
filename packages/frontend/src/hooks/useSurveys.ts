import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { surveysApi } from '../services/api'
import type {
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateServiceDateRequest,
} from '@ct-service-survey/shared'

// Query Keys
const surveyKeys = {
  all: ['surveys'] as const,
  detail: (id: string) => ['surveys', id] as const,
}

// Alle Umfragen abrufen
export function useSurveys() {
  return useQuery({
    queryKey: surveyKeys.all,
    queryFn: surveysApi.getAll,
  })
}

// Einzelne Umfrage abrufen
export function useSurvey(id: string) {
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveysApi.getById(id),
    enabled: !!id,
  })
}

// Umfrage erstellen
export function useCreateSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => surveysApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all })
    },
  })
}

// Umfrage aktualisieren
export function useUpdateSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyRequest }) =>
      surveysApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.id) })
    },
  })
}

// Umfrage löschen
export function useDeleteSurvey() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all })
    },
  })
}

// ServiceDate hinzufügen
export function useAddServiceDate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: CreateServiceDateRequest }) =>
      surveysApi.addServiceDate(surveyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  })
}

// ServiceDate löschen
export function useDeleteServiceDate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ surveyId, serviceDateId }: { surveyId: string; serviceDateId: string }) =>
      surveysApi.deleteServiceDate(surveyId, serviceDateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  })
}
