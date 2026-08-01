import { Link } from 'react-router-dom'
import {
  Card,
  CardHeader,
  Button,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { Add24Regular } from '@fluentui/react-icons'
import { useSurveys } from '../hooks/useSurveys'
import type { SurveyDto } from '@ct-service-survey/shared'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: tokens.spacingVerticalXL,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    cursor: 'pointer',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
  },
  statusDraft: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },
  statusActive: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
  },
  statusClosed: {
    backgroundColor: tokens.colorNeutralBackground3,
    color: tokens.colorNeutralForeground3,
  },
})

const statusLabels: Record<SurveyDto['status'], string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  closed: 'Geschlossen',
}

export function SurveysListPage() {
  const styles = useStyles()
  const { data: surveys, isLoading, error } = useSurveys()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Umfragen werden geladen..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Text>Fehler beim Laden der Umfragen: {error.message}</Text>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Umfragen</h1>
        <Link to="/surveys/new">
          <Button appearance="primary" icon={<Add24Regular />}>
            Neue Umfrage
          </Button>
        </Link>
      </div>

      <div className={styles.grid}>
        {surveys?.map((survey) => (
          <Link
            key={survey.id}
            to={`/surveys/${survey.id}`}
            style={{ textDecoration: 'none' }}
          >
            <Card className={styles.card}>
              <CardHeader
                header={<Text weight="semibold">{survey.title}</Text>}
                description={
                  <div>
                    <Text size={300}>{survey.description}</Text>
                    <div style={{ marginTop: '8px' }}>
                      <span
                        className={`${styles.statusBadge} ${
                          survey.status === 'draft'
                            ? styles.statusDraft
                            : survey.status === 'active'
                            ? styles.statusActive
                            : styles.statusClosed
                        }`}
                      >
                        {statusLabels[survey.status]}
                      </span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Link>
        ))}
      </div>

      {surveys?.length === 0 && (
        <Text>Noch keine Umfragen vorhanden.</Text>
      )}
    </div>
  )
}
