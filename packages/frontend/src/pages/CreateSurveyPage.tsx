import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Input,
  Textarea,
  makeStyles,
  tokens,
  Text,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useCreateSurvey } from '../hooks/useSurveys'
import type { SurveyStatus } from '@ct-service-survey/shared'

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

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  closed: 'Geschlossen',
}

export function CreateSurveyPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const createMutation = useCreateSurvey()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<SurveyStatus>('draft')

  const handleSubmit = async () => {
    const result = await createMutation.mutateAsync({
      title,
      description,
      status,
      dates: [], // Dienste werden später hinzugefügt
    })

    // Navigiere zur Bearbeiten-Seite der neuen Umfrage
    navigate(`/admin/surveys/${result.id}`)
  }

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

      <div className={styles.formGroup}>
        <label htmlFor="title">Titel</label>
        <Input
          id="title"
          value={title}
          onChange={(_, data) => setTitle(data.value)}
          required
        />
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description">Beschreibung</label>
        <Textarea
          id="description"
          value={description}
          onChange={(_, data) => setDescription(data.value)}
          resize="vertical"
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
          }}
        >
          {(Object.keys(statusLabels) as SurveyStatus[]).map((s) => (
            <option key={s} value={s}>
              {statusLabels[s]}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          onClick={handleSubmit}
          disabled={!title || createMutation.isPending}
        >
          {createMutation.isPending ? 'Wird erstellt...' : 'Erstellen'}
        </Button>
        <Link to="/admin/surveys">
          <Button>Abbrechen</Button>
        </Link>
      </div>

      {createMutation.isError && (
        <Text style={{ color: tokens.colorPaletteRedForeground1, marginTop: tokens.spacingVerticalM }}>
          Fehler: {createMutation.error.message}
        </Text>
      )}
    </div>
  )
}
