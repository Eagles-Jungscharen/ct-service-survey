import type { ChurchToolsEventDto } from '@ct-service-survey/shared'
import { Button, makeStyles, Text, tokens } from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useMemo, useState } from 'react'
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
  const handleFetchEvents = async () => {
    if (!createSurveyFormPayload.serviceId || !createSurveyFormPayload.startDate || !createSurveyFormPayload.endDate) {
      return
    }

    try {
      const response = await fetchEventsMutation.mutateAsync({
        startDate: new Date(createSurveyFormPayload.startDate).toISOString(),
        endDate: new Date(createSurveyFormPayload.endDate).toISOString(),
        serviceId: createSurveyFormPayload.serviceId,
      })

      setFetchedEvents(response.events)
      setStep(2)
    } catch (error) {
      // Fehler wird durch mutation.isError angezeigt
    }
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
  const handleSubmit = async () => {
    const dates = Array.from(selectedEvents.values()).map((sel) => ({
      date: sel.event.startDate,
      serviceType: String(createSurveyFormPayload.serviceId),
      notes: sel.notes,
    }))

    const result = await createSurveyMutation.mutateAsync({
      title: createSurveyFormPayload.title,
      description: createSurveyFormPayload.description,
      status: createSurveyFormPayload.status,
      dates,
    })

    navigate(`/admin/surveys/${result.id}`)
  }

  const selectedServiceName =
    services?.find((s) => s.id === createSurveyFormPayload.serviceId)?.name || 'Unbekannt'

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link to="/admin/surveys">
          <Button icon={<ArrowLeft24Regular />}>Zurück</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <h1>Neue Umfrage erstellen</h1>
      </div>

      <div className={styles.stepIndicator}>
        <Text weight="semibold">
          Schritt {step} von 2: {step === 1 ? 'Grunddaten und Zeitraum' : 'Termine auswählen'}
        </Text>
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
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          isSubmitting={createSurveyMutation.isPending}
          submitError={createSurveyMutation.isError ? createSurveyMutation.error.message : undefined}
        />
      )}
    </div>
  )
}
        