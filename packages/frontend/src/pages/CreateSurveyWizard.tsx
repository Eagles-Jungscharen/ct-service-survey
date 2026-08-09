import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Input,
  Textarea,
  makeStyles,
  tokens,
  Text,
  Spinner,
  Checkbox,
  Dropdown,
  Option,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useCreateSurvey, useFetchChurchToolsEvents } from '../hooks/useSurveys'
import { useServices } from '../hooks/useServices'
import type { SurveyStatus, ChurchToolsEventDto } from '@ct-service-survey/shared'

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

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  closed: 'Geschlossen',
}

interface SelectedEvent {
  event: ChurchToolsEventDto
  notes: string
}

export function CreateSurveyWizard() {
  const styles = useStyles()
  const navigate = useNavigate()
  const createSurveyMutation = useCreateSurvey()
  const fetchEventsMutation = useFetchChurchToolsEvents()
  const { data: services, isLoading: servicesLoading } = useServices()

  // Wizard State
  const [step, setStep] = useState(1)

  // Step 1: Survey-Grunddaten + Zeitraum + Dienst
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<SurveyStatus>('draft')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null)

  // Step 2: Event-Auswahl
  const [fetchedEvents, setFetchedEvents] = useState<ChurchToolsEventDto[]>([])
  const [selectedEvents, setSelectedEvents] = useState<Map<number, SelectedEvent>>(new Map())

  // Schritt 1 → Schritt 2: Events aus ChurchTools holen
  const handleFetchEvents = async () => {
    if (!selectedServiceId || !startDate || !endDate) {
      return
    }

    try {
      const response = await fetchEventsMutation.mutateAsync({
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        serviceId: selectedServiceId,
      })

      setFetchedEvents(response.events)
      setStep(2)
    } catch (error) {
      // Fehler wird durch mutation.isError angezeigt
    }
  }

  // Event auswählen/abwählen
  const toggleEvent = (event: ChurchToolsEventDto) => {
    const newSelected = new Map(selectedEvents)
    if (newSelected.has(event.id)) {
      newSelected.delete(event.id)
    } else {
      newSelected.set(event.id, { event, notes: '' })
    }
    setSelectedEvents(newSelected)
  }

  // Notes für Event aktualisieren
  const updateEventNotes = (eventId: number, notes: string) => {
    const newSelected = new Map(selectedEvents)
    const existing = newSelected.get(eventId)
    if (existing) {
      newSelected.set(eventId, { ...existing, notes })
    }
    setSelectedEvents(newSelected)
  }

  // Umfrage erstellen (Submit)
  const handleSubmit = async () => {
    const dates = Array.from(selectedEvents.values()).map((sel) => ({
      date: sel.event.startDate,
      serviceType: String(selectedServiceId),
      notes: sel.notes,
    }))

    const result = await createSurveyMutation.mutateAsync({
      title,
      description,
      status,
      dates,
    })

    navigate(`/admin/surveys/${result.id}`)
  }

  const selectedServiceName =
    services?.find((s) => s.id === selectedServiceId)?.name || 'Unbekannt'

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
        <>
          <div className={styles.formGroup}>
            <label htmlFor="title">Titel der Umfrage</label>
            <Input
              id="title"
              value={title}
              onChange={(_, data) => setTitle(data.value)}
              required
              placeholder="z.B. Lobpreis-Dienste Januar 2026"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Beschreibung (optional)</label>
            <Textarea
              id="description"
              value={description}
              onChange={(_, data) => setDescription(data.value)}
              resize="vertical"
              placeholder="Weitere Informationen zur Umfrage..."
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as SurveyStatus)}
              style={{
                padding: '8px',
                borderRadius: tokens.borderRadiusMedium,
                border: `1px solid ${tokens.colorNeutralStroke1}`,
                width: '100%',
              }}
            >
              {(Object.keys(statusLabels) as SurveyStatus[]).map((s) => (
                <option key={s} value={s}>
                  {statusLabels[s]}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.dateGroup}>
            <div className={styles.formGroup}>
              <label htmlFor="startDate">Start-Datum</label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(_, data) => setStartDate(data.value)}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endDate">End-Datum</label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(_, data) => setEndDate(data.value)}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="service">Dienst</label>
            {servicesLoading ? (
              <Spinner size="small" label="Lade Dienste..." />
            ) : (
              <Dropdown
                placeholder="Dienst auswählen..."
                value={selectedServiceName}
                selectedOptions={selectedServiceId ? [String(selectedServiceId)] : []}
                onOptionSelect={(_, data) =>
                  setSelectedServiceId(data.optionValue ? Number(data.optionValue) : null)
                }
              >
                {services?.map((service) => (
                  <Option key={service.id} value={String(service.id)}>
                    {service.name}
                  </Option>
                ))}
              </Dropdown>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              appearance="primary"
              onClick={handleFetchEvents}
              disabled={
                !title ||
                !startDate ||
                !endDate ||
                !selectedServiceId ||
                fetchEventsMutation.isPending
              }
            >
              {fetchEventsMutation.isPending ? 'Lädt Events...' : 'Weiter'}
            </Button>
            <Link to="/admin/surveys">
              <Button>Abbrechen</Button>
            </Link>
          </div>

          {fetchEventsMutation.isError && (
            <Text className={styles.errorText}>
              Fehler beim Abrufen der Events: {fetchEventsMutation.error.message}
            </Text>
          )}
        </>
      )}

      {step === 2 && (
        <>
          <Text>
            <strong>Titel:</strong> {title}
          </Text>
          <Text>
            <strong>Dienst:</strong> {selectedServiceName}
          </Text>
          <Text>
            <strong>Zeitraum:</strong> {startDate} bis {endDate}
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
