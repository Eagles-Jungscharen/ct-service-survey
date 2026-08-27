import type { ChurchToolsEventDto, CreateSurveyRequest, SurveyDto } from '@ct-service-survey/shared';
import { Button, makeStyles, Title3, Subtitle2, Text, tokens } from '@fluentui/react-components';
import { UseMutationResult } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { EventTableRow } from './EventTableRow';
import { useFormattedDate } from '../../hooks/useFormattedDate';
import { CreateSurveyFormPayload, SelectedEvent } from '../../models/CreateSurveyFormPayload';

const useStyles = makeStyles({
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXL,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    marginTop: tokens.spacingVerticalM,
  },
  eventsTable: {
    marginTop: tokens.spacingVerticalL,
  },
  noEventsHint: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalL,
  },
  headerPart: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground3,
    padding: tokens.spacingVerticalL,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorBrandStroke1}`,
  }
});

interface Step2FormProps {
  createSurveyFormPayload: CreateSurveyFormPayload;
  selectedServiceName: string;
  fetchedEvents: ChurchToolsEventDto[];
  onBack: () => void;
  handleRemoveSelectedEvent: (eventId: number) => void;
  handleAddSelectedEvent: (event: SelectedEvent) => void;
  handleUpdateSelectedEventNotes: (eventId: number, notes: string) => void;
  createSurveyMutation: UseMutationResult<SurveyDto, Error, CreateSurveyRequest, unknown>
}

export const Step2Form: React.FunctionComponent<Step2FormProps> = (props: Step2FormProps) => {
  const {
    createSurveyFormPayload,
    selectedServiceName,
    fetchedEvents,
    onBack,
    handleRemoveSelectedEvent,
    handleAddSelectedEvent,
    handleUpdateSelectedEventNotes,
    createSurveyMutation
  } = props;
  const styles = useStyles();
  const navigate = useNavigate();

  const startDate = useFormattedDate(createSurveyFormPayload.startDate);
  const endDate = useFormattedDate(createSurveyFormPayload.endDate);

  const selectedEvents = useMemo(() => {
    return new Map(createSurveyFormPayload.selectedEvents.map((e) => [e.event.id, e]));
  }, [createSurveyFormPayload.selectedEvents]);

  const isSubmitting = React.useMemo(() => {
    return createSurveyMutation.isPending;
  }, [createSurveyMutation.isPending]);

  const submitError = React.useMemo(() => {
    return createSurveyMutation.isError ? createSurveyMutation.error.message : undefined;
  }, [createSurveyMutation.isError, createSurveyMutation.error]);

  const handleSubmit = () => {
    const dates = Array.from(selectedEvents.values()).map((sel) => ({
      date: sel.event.startDate,
      serviceType: String(createSurveyFormPayload.serviceId),
      notes: sel.notes,
    }))

    const doSubmit = async () => {

      const result = await createSurveyMutation.mutateAsync({
        title: createSurveyFormPayload.title,
        description: createSurveyFormPayload.description,
        dates,
      })

      await navigate(`/admin/surveys/${result.id}`)
    }
    void doSubmit();
  }

  return (
    <>
      <div className={styles.headerPart}>
        <Title3>{createSurveyFormPayload.title}</Title3>
        <Subtitle2>Dienst: {selectedServiceName}</Subtitle2>
        <Subtitle2>Zeitraum: {startDate} bis {endDate}</Subtitle2>
      </div>

      {fetchedEvents.length === 0 ? (
        <div className={styles.noEventsHint}>
          <Text weight="semibold">Keine Events gefunden</Text>
          <Text>
            Für den gewählten Zeitraum und Dienst wurden keine Termine in ChurchTools gefunden.
            Sie können manuell Termine hinzufügen oder einen anderen Zeitraum wählen.
          </Text>
          {/* TODO: Manuell hinzufügen Button */}
        </div>
      ) : (
        <div className={styles.eventsTable}>
          <Text weight="semibold">
            {fetchedEvents.length} Termin(e) gefunden - Wählen Sie die gewünschten aus:
          </Text>
          <table style={{ width: '100%', marginTop: tokens.spacingVerticalM }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px' }}>Auswahl</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Name</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Datum</th>
                <th style={{ textAlign: 'left', padding: '8px' }}>Notizen</th>
              </tr>
            </thead>
            <tbody>
              {fetchedEvents.map((event) => (
                <EventTableRow
                  key={event.id}
                  event={event}
                  isSelected={selectedEvents.has(event.id)}
                  notes={selectedEvents.get(event.id)?.notes ?? ''}
                  handleRemoveSelectedEvent={handleRemoveSelectedEvent}
                  handleAddSelectedEvent={handleAddSelectedEvent}
                  handleUpdateSelectedEventNotes={handleUpdateSelectedEventNotes}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.actions}>
        <Button onClick={onBack}>Zurück</Button>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          disabled={selectedEvents.size === 0 || isSubmitting}
        >
          {isSubmitting ? 'Wird erstellt...' : 'Umfrage erstellen'}
        </Button>
      </div>

      {submitError && (
        <Text className={styles.errorText}>
          Fehler beim Erstellen der Umfrage: {submitError}
        </Text>
      )}
    </>
  )
}
