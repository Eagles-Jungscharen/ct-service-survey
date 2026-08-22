import { Button, Input, makeStyles, tokens, Text, Checkbox } from '@fluentui/react-components';
import type { ChurchToolsEventDto } from '@ct-service-survey/shared';
import { CreateSurveyFormPayload } from '../../models/CreateSurveyFormPayload';

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
});

interface Step2FormProps {
  createSurveyFormPayload: CreateSurveyFormPayload
  selectedServiceName: string
  fetchedEvents: ChurchToolsEventDto[]
  selectedEvents: Map<number, { event: ChurchToolsEventDto; notes: string }>
  toggleEvent: (event: ChurchToolsEventDto) => void
  updateEventNotes: (eventId: number, notes: string) => void
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
  submitError: string | undefined
}

export const Step2Form: React.FunctionComponent<Step2FormProps> = ({
  createSurveyFormPayload,
  selectedServiceName,
  fetchedEvents,
  selectedEvents,
  toggleEvent,
  updateEventNotes,
  onBack,
  onSubmit,
  isSubmitting,
  submitError,
}) => {
  const styles = useStyles()

  return (
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
        <Button onClick={onBack}>Zurück</Button>
        <Button
          appearance="primary"
          onClick={onSubmit}
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
