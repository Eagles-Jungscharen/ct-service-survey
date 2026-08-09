import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { surveysApi } from '../services/api'
import type {
  CreateSurveyRequest,
  UpdateSurveyRequest,
  CreateServiceDateRequest,
  FetchEventsRequest,
} from '@ct-service-survey/shared'
import { useAppAuth } from './useAppAuthContext';

// Query Keys
const surveyKeys = {
  all: ['surveys'] as const,
  detail: (id: string) => ['surveys', id] as const,
}

// Alle Umfragen abrufen
export function useSurveys() {
  const auth = useAppAuth();
  return useQuery({
    queryKey: surveyKeys.all,
    queryFn: () => surveysApi.getAll(auth.token!),
  })
}

// Einzelne Umfrage abrufen
export function useSurvey(id: string) {
  const auth = useAppAuth();
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveysApi.getById(id, auth.token!),
    enabled: !!id,
  })
}

// Umfrage erstellen
export function useCreateSurvey() {
  const queryClient = useQueryClient();
  const auth = useAppAuth();
  
  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => surveysApi.create(data, auth.token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all })
    },
  })
}

// Umfrage aktualisieren
export function useUpdateSurvey() {
  const queryClient = useQueryClient();
  const auth = useAppAuth();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyRequest }) =>
      surveysApi.update(id, data, auth.token!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.id) })
    },
  })
}

// Umfrage löschen
export function useDeleteSurvey() {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id, auth.token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.all })
    },
  })
}

// ServiceDate hinzufügen
export function useAddServiceDate() {
  const queryClient = useQueryClient();
  const auth = useAppAuth();
  
  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: CreateServiceDateRequest }) =>
      surveysApi.addServiceDate(surveyId, data, auth.token!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  })
}

// ServiceDate löschen
export function useDeleteServiceDate() {
  const queryClient = useQueryClient();
  const auth = useAppAuth();
  
  return useMutation({
    mutationFn: ({ surveyId, serviceDateId }: { surveyId: string; serviceDateId: string }) =>
      surveysApi.deleteServiceDate(surveyId, serviceDateId, auth.token!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  })
}

// Events aus ChurchTools abrufen (für Survey-Wizard)
export function useFetchChurchToolsEvents() {
  const auth = useAppAuth();
  
  return useMutation({
    mutationFn: (data: FetchEventsRequest) => surveysApi.fetchEvents(data, auth.token!),
  })
}
