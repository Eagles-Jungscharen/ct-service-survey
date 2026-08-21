import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input, makeStyles, tokens, Text, Checkbox, } from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useCreateSurvey, useFetchChurchToolsEvents } from '../hooks/useSurveys'
import { useServices } from '../hooks/useServices'
import type { ChurchToolsEventDto } from '@ct-service-survey/shared'
import { Step1Form } from '../components/createSurveyWizard/Step1Form'
import { useCreateSurveyFormHandlers } from '../hooks/useCreateSurveyFormHandlers'

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
  eventsTable: {
    marginTop: tokens.spacingVerticalL,
  },
  noEventsHint: {
    padding: tokens.spacingVerticalL,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    marginTop: tokens.spacingVerticalL,
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
        <>
          <Text>
            <strong>Titel:</strong> {createSurveyFormPayload.title}
          </Text>
          <Text>
            <strong>Dienst:</strong> {selectedServiceName}
          </Text>
          <Text>
            <strong>Zeitraum:</strong> {createSurveyFormPayload.startDate} bis {createSurveyFormPayload.endDate}
          </Text>

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
                    <tr key={event.id}>
                      <td style={{ padding: '8px' }}>
                        <Checkbox
                          checked={selectedEvents.has(event.id)}
                          onChange={() => toggleEvent(event)}
                        />
                      </td>
                      <td style={{ padding: '8px' }}>{event.name}</td>
                      <td style={{ padding: '8px' }}>
                        {new Date(event.startDate).toLocaleDateString('de-CH')}
                      </td>
                      <td style={{ padding: '8px' }}>
                        <Input
                          value={selectedEvents.get(event.id)?.notes || ''}
                          onChange={(_, data) => updateEventNotes(event.id, data.value)}
                          disabled={!selectedEvents.has(event.id)}
                          placeholder="Optionale Notizen..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className={styles.actions}>
            <Button onClick={() => setStep(1)}>Zurück</Button>
            <Button
              appearance="primary"
              onClick={handleSubmit}
              disabled={selectedEvents.size === 0 || createSurveyMutation.isPending}
            >
              {createSurveyMutation.isPending ? 'Wird erstellt...' : 'Umfrage erstellen'}
            </Button>
          </div>

          {createSurveyMutation.isError && (
            <Text className={styles.errorText}>
              Fehler beim Erstellen der Umfrage: {createSurveyMutation.error.message}
            </Text>
          )}
        </>
      )}
    </div>
  )
}
