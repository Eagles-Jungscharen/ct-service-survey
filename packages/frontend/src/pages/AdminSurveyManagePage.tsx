import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Spinner,
  Text,
  makeStyles,
  tokens,
  Input,
  Textarea,
  Card,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components'
import {
  ArrowLeft24Regular,
  MoreVertical24Regular,
  Delete24Regular,
} from '@fluentui/react-icons'
import { useSurvey, useUpdateSurvey, useDeleteServiceDate } from '../hooks/useSurveys'
import type { SurveyStatus } from '@ct-service-survey/shared'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  backButton: {
    marginBottom: tokens.spacingVerticalM,
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  section: {
    marginBottom: tokens.spacingVerticalXL,
  },
  formGroup: {
    marginBottom: tokens.spacingVerticalM,
  },
  serviceDateCard: {
    marginBottom: tokens.spacingVerticalM,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
})

const statusLabels: Record<SurveyStatus, string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  closed: 'Geschlossen',
}

export function AdminSurveyManagePage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading } = useSurvey(id!)
  const updateMutation = useUpdateSurvey()
  const deleteServiceDateMutation = useDeleteServiceDate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<SurveyStatus>('draft')

  // State mit Umfragedaten initialisieren
  useState(() => {
    if (survey) {
      setTitle(survey.title)
      setDescription(survey.description || '')
      setStatus(survey.status)
    }
  })

  const handleSave = async () => {
    if (!id) return

    await updateMutation.mutateAsync({
      id,
      data: {
        title,
        description,
        status,
      },
    })

    navigate(`/admin/surveys/${id}/assignments`)
  }

  const handleDeleteServiceDate = async (serviceDateId: string) => {
    if (!id || !confirm('Dienst wirklich löschen?')) return

    await deleteServiceDateMutation.mutateAsync({
      surveyId: id,
      serviceDateId,
    })
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
        <Link to="/admin/surveys">
          <Button icon={<ArrowLeft24Regular />}>Zurück zur Verwaltung</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <h1>Umfrage bearbeiten</h1>
      </div>

      <div className={styles.section}>
        <h2>Grunddaten</h2>
        
        <div className={styles.formGroup}>
          <label htmlFor="title">Titel</label>
          <Input
            id="title"
            value={title}
            onChange={(_, data) => setTitle(data.value)}
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
      </div>

      <div className={styles.section}>
        <h2>Dienste</h2>
        
        {survey.dates.map((serviceDate) => (
          <Card key={serviceDate.id} className={styles.serviceDateCard}>
            <div>
              <Text weight="semibold">
                {new Date(serviceDate.date).toLocaleDateString('de-DE', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
              <Text size={300} style={{ display: 'block' }}>
                {serviceDate.serviceTypeName}
              </Text>
            </div>

            <Menu>
              <MenuTrigger disableButtonEnhancement>
                <Button icon={<MoreVertical24Regular />} appearance="subtle" />
              </MenuTrigger>
              <MenuPopover>
                <MenuList>
                  <MenuItem icon={<Delete24Regular />} onClick={() => handleDeleteServiceDate(serviceDate.id)}>
                    Löschen
                  </MenuItem>
                </MenuList>
              </MenuPopover>
            </Menu>
          </Card>
        ))}

        {survey.dates.length === 0 && (
          <Text>Noch keine Dienste definiert.</Text>
        )}
      </div>

      <div className={styles.actions}>
        <Button
          appearance="primary"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Wird gespeichert...' : 'Speichern'}
        </Button>
        <Link to={`/admin/surveys/${id}/assignments`}>
          <Button>Zu Einteilungen</Button>
        </Link>
      </div>

      {updateMutation.isError && (
        <Text style={{ color: tokens.colorPaletteRedForeground1 }}>
          Fehler: {updateMutation.error.message}
        </Text>
      )}
    </div>
  )
}
