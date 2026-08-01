import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Spinner,
  Text,
  makeStyles,
  tokens,
  RadioGroup,
  Radio,
  Textarea,
  Card,
  CardHeader,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useSurvey } from '../hooks/useSurveys'
import { useMyResponses, useSubmitResponses } from '../hooks/useResponses'
import type { ServiceDateResponseRequest, AvailabilityStatus } from '@ct-service-survey/shared'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    marginBottom: tokens.spacingVerticalM,
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  serviceDateCard: {
    marginBottom: tokens.spacingVerticalL,
  },
  formGroup: {
    marginTop: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  actions: {
    marginTop: tokens.spacingVerticalXL,
    display: 'flex',
    gap: tokens.spacingHorizontalM,
  },
})

const availabilityLabels: Record<AvailabilityStatus, string> = {
  yes: 'Ja, ich kann',
  no: 'Nein, ich kann nicht',
  maybe: 'Vielleicht',
  unknown: 'Noch nicht bekannt',
}

export function SurveyResponsePage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading: surveyLoading } = useSurvey(id!)
  const { data: existingResponses, isLoading: responsesLoading } = useMyResponses(id!)
  const submitMutation = useSubmitResponses()

  // State für die Form-Daten
  const [responses, setResponses] = useState<Map<string, ServiceDateResponseRequest>>(new Map())

  // Bestehende Antworten in State laden
  useEffect(() => {
    if (existingResponses) {
      const responseMap = new Map<string, ServiceDateResponseRequest>()
      existingResponses.forEach((response) => {
        responseMap.set(response.serviceDateId, {
          serviceDateId: response.serviceDateId,
          availability: response.availability,
          remarks: response.remarks,
        })
      })
      setResponses(responseMap)
    }
  }, [existingResponses])

  const handleAvailabilityChange = (serviceDateId: string, availability: AvailabilityStatus) => {
    setResponses((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(serviceDateId) || { serviceDateId, availability: 'unknown' as AvailabilityStatus, remarks: '' }
      newMap.set(serviceDateId, { ...existing, availability })
      return newMap
    })
  }

  const handleRemarksChange = (serviceDateId: string, remarks: string) => {
    setResponses((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(serviceDateId) || { serviceDateId, availability: 'unknown' as AvailabilityStatus, remarks: '' }
      newMap.set(serviceDateId, { ...existing, remarks })
      return newMap
    })
  }

  const handleSubmit = async () => {
    if (!id) return

    const responseArray = Array.from(responses.values())
    await submitMutation.mutateAsync({
      surveyId: id,
      responses: responseArray,
    })

    navigate(`/surveys/${id}`)
  }

  if (surveyLoading || responsesLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Daten werden geladen..." />
      </div>
    )
  }

  if (!survey) {
    return (
      <div className={styles.container}>
        <Text>Umfrage nicht gefunden.</Text>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link to={`/surveys/${id}`}>
          <Button icon={<ArrowLeft24Regular />}>Zurück</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <h1>Verfügbarkeit melden</h1>
        <Text>{survey.title}</Text>
      </div>

      {survey.dates.map((serviceDate) => {
        const response = responses.get(serviceDate.id)
        
        return (
          <Card key={serviceDate.id} className={styles.serviceDateCard}>
            <CardHeader
              header={
                <Text weight="semibold">
                  {new Date(serviceDate.date).toLocaleDateString('de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              }
              description={
                <div>
                  <Text>{serviceDate.serviceTypeName}</Text>
                  {serviceDate.notes && (
                    <Text size={200} style={{ display: 'block', marginTop: '4px' }}>
                      {serviceDate.notes}
                    </Text>
                  )}
                </div>
              }
            />
            
            <div className={styles.formGroup}>
              <RadioGroup
                value={response?.availability || 'unknown'}
                onChange={(_, data) =>
                  handleAvailabilityChange(serviceDate.id, data.value as AvailabilityStatus)
                }
              >
                {(Object.keys(availabilityLabels) as AvailabilityStatus[]).map((status) => (
                  <Radio
                    key={status}
                    value={status}
                    label={availabilityLabels[status]}
                  />
                ))}
              </RadioGroup>

              <Textarea
                placeholder="Optionale Bemerkung"
                value={response?.remarks || ''}
                onChange={(_, data) =>
                  handleRemarksChange(serviceDate.id, data.value)
                }
                resize="vertical"
              />
            </div>
          </Card>
        )
      })}

      <div className={styles.actions}>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Wird gespeichert...' : 'Absenden'}
        </Button>
        <Link to={`/surveys/${id}`}>
          <Button>Abbrechen</Button>
        </Link>
      </div>

      {submitMutation.isError && (
        <Text style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalM }}>
          Fehler beim Speichern: {submitMutation.error.message}
        </Text>
      )}
    </div>
  )
}
