import type { ActivateSurveyRequest, CreateSurveyRequest, UpdateSurveyRequest, CreateServiceDateRequest, FetchEventsRequest, } from '@ct-service-survey/shared';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAppAuth } from './useAppAuthContext';
import { surveysApi } from '../services/api';

// Query Keys
const surveyKeys = {
  all: ['surveys'] as const,
  invited: ['surveys', 'invited'] as const,
  detail: (id: string) => ['surveys', id] as const,
  byTag: (tag: string) => ['surveys', 'by-tag', tag] as const,
}

// Alle Umfragen abrufen
export const useSurveys = () => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: surveyKeys.all,
    queryFn: () => surveysApi.getAll(auth.token!),
  });
}

// Nur eingeladene Umfragen abrufen (invitedPersonIds enthält userId)
export const useInvitedSurveys = () => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: surveyKeys.invited,
    queryFn: () => surveysApi.getInvited(auth.token!),
  });
}

// Einzelne Umfrage abrufen
export const useSurvey = (id: string) => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: surveyKeys.detail(id),
    queryFn: () => surveysApi.getById(id, auth.token!),
    enabled: !!id,
  });
}

// Umfrage erstellen
export const useCreateSurvey = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: (data: CreateSurveyRequest) => surveysApi.create(data, auth.token!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.invited })
    },
  });
}

// Umfrage aktualisieren
export const useUpdateSurvey = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSurveyRequest }) =>
      surveysApi.update(id, data, auth.token!),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.invited })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.id) })
    },
  });
}

// Umfrage löschen
export const useDeleteSurvey = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: (id: string) => surveysApi.delete(id, auth.token!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.invited })
    },
  });
}

// ServiceDate hinzufügen
export const useAddServiceDate = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: CreateServiceDateRequest }) =>
      surveysApi.addServiceDate(surveyId, data, auth.token!),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  });
}

// ServiceDate löschen
export const useDeleteServiceDate = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: ({ surveyId, serviceDateId }: { surveyId: string; serviceDateId: string }) =>
      surveysApi.deleteServiceDate(surveyId, serviceDateId, auth.token!),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  });
}

// Events aus ChurchTools abrufen (für Survey-Wizard)
export const useFetchChurchToolsEvents = () => {
  const auth = useAppAuth();

  return useMutation({
    mutationFn: (data: FetchEventsRequest) => surveysApi.fetchEvents(data, auth.token!),
  });
}

// Umfrage aktivieren
export const useActivateSurvey = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: ({ surveyId, data }: { surveyId: string; data: ActivateSurveyRequest }) =>
      surveysApi.activate(surveyId, data, auth.token!),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.invited })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  });
}

// Umfrage schließen
export const useCloseSurvey = () => {
  const queryClient = useQueryClient();
  const auth = useAppAuth();

  return useMutation({
    mutationFn: ({ surveyId }: { surveyId: string }) =>
      surveysApi.close(surveyId, auth.token!),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: surveyKeys.all })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.invited })
      void queryClient.invalidateQueries({ queryKey: surveyKeys.detail(variables.surveyId) })
    },
  });
}


// Umfrage anhand TAG abrufen (öffentlich, keine Auth erforderlich)
export const useSurveyByTag = (tag: string) => {
  const auth = useAppAuth();
  return useQuery({
    queryKey: surveyKeys.byTag(tag),
    queryFn: () => surveysApi.getByTag(tag, auth.token!),
    enabled: !!tag && tag.length === 6,
    retry: false, // Bei 404 nicht wiederholen
  });
}
