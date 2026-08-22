import type { ChurchToolsEventDto } from '@ct-service-survey/shared'
import { Button, makeStyles, Text, Title1, Title3, tokens } from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useCallback, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Step1Form } from '../components/createSurveyWizard/Step1Form'
import { Step2Form } from '../components/createSurveyWizard/Step2Form'
import { useCreateSurveyFormHandlers } from '../hooks/useCreateSurveyFormHandlers'
import { useServices } from '../hooks/useServices'
import { useCreateSurvey, useFetchChurchToolsEvents } from '../hooks/useSurveys'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1000px',
    margin: '0 auto',
  },
  backButton: {
    marginBottom: tokens.spacingVerticalM,
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  formGroup: {
    marginBottom: tokens.spacingVerticalM,
  },
  dateGroup: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXL,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    marginTop: tokens.spacingVerticalM,
  },
  stepIndicator: {
    marginBottom: tokens.spacingVerticalL,
    paddingBottom: tokens.spacingVerticalM,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
  },
})

export const CreateSurveyWizard: React.FunctionComponent = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const createSurveyMutation = useCreateSurvey();
  const fetchEventsMutation = useFetchChurchToolsEvents()
  const { data: services, isLoading: servicesLoading } = useServices();

  // Wizard State
  const [step, setStep] = useState(1);

  const { createSurveyFormPayload, handleTextChange, handleStatusChange, handleAddSelectedEvent, handleRemoveSelectedEvent, handleServiceIdChange, handleUpdateSelectedEventNotes } = useCreateSurveyFormHandlers();

  const selectedEvents = useMemo(() => {
    return new Map(createSurveyFormPayload.selectedEvents.map((e) => [e.event.id, e]));
  }, [createSurveyFormPayload.selectedEvents]);

  // Step 2: Event-Auswahl
  const [fetchedEvents, setFetchedEvents] = useState<ChurchToolsEventDto[]>([])

  // Schritt 1 → Schritt 2: Events aus ChurchTools holen
  const handleFetchEvents = () => {
    if (!createSurveyFormPayload.serviceId || !createSurveyFormPayload.startDate || !createSurveyFormPayload.endDate) {
      return
    }

    const doFetch = async () => {
      try {
        const response = await fetchEventsMutation.mutateAsync({
          startDate: new Date(createSurveyFormPayload.startDate).toISOString(),
          endDate: new Date(createSurveyFormPayload.endDate).toISOString(),
          serviceId: createSurveyFormPayload.serviceId!,
        })

        setFetchedEvents(response.events)
        setStep(2)
      } catch (error) {
        // Fehler wird durch mutation.isError angezeigt
      }
    }
    void doFetch();
  }

  // Event auswählen/abwählen
  const toggleEvent = (event: ChurchToolsEventDto) => {
    if (selectedEvents.has(event.id)) {
      handleRemoveSelectedEvent(event.id)
    } else {
      handleAddSelectedEvent({ event, notes: '' })
    }
  }

  // Notes für Event aktualisieren
  const updateEventNotes = (eventId: number, notes: string) => {
    handleUpdateSelectedEventNotes(eventId, notes);
  }

  // Umfrage erstellen (Submit)
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
        status: createSurveyFormPayload.status,
        dates,
      })

      await navigate(`/admin/surveys/${result.id}`)
    }
    void doSubmit();
  }

  const handleBackToStep1 = useCallback(() => {
    setStep(1);
  }, []);

  const selectedServiceName =
    services?.find((s) => s.id === createSurveyFormPayload.serviceId)?.name ?? 'Unbekannt'

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link to="/admin/surveys">
          <Button icon={<ArrowLeft24Regular />}>Zurück</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <Title1>Neue Umfrage erstellen</Title1>
      </div>

      <div className={styles.stepIndicator}>
        <Title3>
          Schritt {step} von 2: {step === 1 ? 'Grunddaten und Zeitraum' : 'Termine auswählen'}
        </Title3>
      </div>

      {step === 1 && (
        <Step1Form
          createSurveyFormPayload={createSurveyFormPayload}
          services={services}
          servicesLoading={servicesLoading}
          fetchEventsMutation={fetchEventsMutation}
          onFetchEvents={handleFetchEvents}
          handleTextChange={handleTextChange}
          handleStatusChange={handleStatusChange}
          handleServiceIdChange={handleServiceIdChange}
        />
      )}

      {step === 2 && (
        <Step2Form
          createSurveyFormPayload={createSurveyFormPayload}
          selectedServiceName={selectedServiceName}
          fetchedEvents={fetchedEvents}
          selectedEvents={selectedEvents}
          toggleEvent={toggleEvent}
          updateEventNotes={updateEventNotes}
          onBack={handleBackToStep1}
          onSubmit={handleSubmit}
          isSubmitting={createSurveyMutation.isPending}
          submitError={createSurveyMutation.isError ? createSurveyMutation.error.message : undefined}
        />
      )}
    </div>
  )
}
