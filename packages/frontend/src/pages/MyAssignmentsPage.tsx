import { Link } from 'react-router-dom'
import {
  Card,
  CardHeader,
  Spinner,
  Text,
  makeStyles,
  tokens,
} from '@fluentui/react-components'
import { useMyAssignments } from '../hooks/useAssignments'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: tokens.spacingHorizontalL,
  },
  card: {
    cursor: 'pointer',
    ':hover': {
      boxShadow: tokens.shadow8,
    },
  },
})

export function MyAssignmentsPage() {
  const styles = useStyles()
  const { data: assignments, isLoading, error } = useMyAssignments()

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Einteilungen werden geladen..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Text>Fehler beim Laden der Einteilungen: {error.message}</Text>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Meine Einteilungen</h1>
      </div>

      <div className={styles.grid}>
        {assignments?.map((assignment) => (
          <Link
            key={`${assignment.surveyId}-${assignment.serviceDateId}`}
            to={`/surveys/${assignment.surveyId}`}
            style={{ textDecoration: 'none' }}
          >
            <Card className={styles.card}>
              <CardHeader
                header={<Text weight="semibold">{assignment.surveyTitle}</Text>}
                description={
                  <div>
                    <Text size={300}>
                      {new Date(assignment.date).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </Text>
                    <Text size={200} style={{ display: 'block', marginTop: '4px' }}>
                      {assignment.serviceTypeName}
                    </Text>
                    <Text size={200} style={{ display: 'block', marginTop: '8px', fontStyle: 'italic' }}>
                      Eingeteilt am: {new Date(assignment.assignedAt).toLocaleDateString('de-DE')}
                    </Text>
                  </div>
                }
              />
            </Card>
          </Link>
        ))}
      </div>

      {assignments?.length === 0 && (
        <Text>Du hast aktuell keine Einteilungen.</Text>
      )}
    </div>
  )
}
