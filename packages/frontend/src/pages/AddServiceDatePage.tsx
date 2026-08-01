import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Input,
  Textarea,
  makeStyles,
  tokens,
  Text,
  Spinner,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useSurvey, useAddServiceDate } from '../hooks/useSurveys'

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
  formGroup: {
    marginBottom: tokens.spacingVerticalM,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXL,
  },
})

export function AddServiceDatePage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading } = useSurvey(id!)
  const addMutation = useAddServiceDate()

  const [date, setDate] = useState('')
  const [serviceType, setServiceType] = useState('')
  const [requiredPeople, setRequiredPeople] = useState(1)
  const [notes, setNotes] = useState('')

  const handleSubmit = async () => {
    if (!id) return

    await addMutation.mutateAsync({
      surveyId: id,
      data: {
        date,
        serviceType,
        requiredPeople,
        notes,
      },
    })

    navigate(`/admin/surveys/${id}`)
  }

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Umfrage wird geladen..." />
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
        <Link to={`/admin/surveys/${id}`}>
          <Button icon={<ArrowLeft24Regular />}>Zurück</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <h1>Dienst hinzufügen</h1>
        <Text>{survey.title}</Text>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="date">Datum</label>
        <Input
          id="date"
          type="date"
          value={date}
          onChange={(_, data) => setDate(data.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="serviceType">Dienst-Typ (ChurchTools Service ID)</label>
        <Input
          id="serviceType"
          value={serviceType}
          onChange={(_, data) => setServiceType(data.value)}
          required
          placeholder="z.B. 42"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="requiredPeople">Benötigte Personen</label>
        <Input
          id="requiredPeople"
          type="number"
          value={requiredPeople.toString()}
          onChange={(_, data) => setRequiredPeople(parseInt(data.value) || 1)}
          min="1"
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="notes">Notizen (optional)</label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(_, data) => setNotes(data.value)}
          resize="vertical"
        />
      </div>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          disabled={!date || !serviceType || addMutation.isPending}
        >
          {addMutation.isPending ? 'Wird hinzugefügt...' : 'Hinzufügen'}
        </Button>
        <Link to={`/admin/surveys/${id}`}>
          <Button>Abbrechen</Button>
        </Link>
      </div>

      {addMutation.isError && (
        <Text style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalM }}>
          Fehler: {addMutation.error.message}
        </Text>
      )}
    </div>
  )
}
