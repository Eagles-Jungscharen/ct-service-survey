import { Button, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Add24Regular } from '@fluentui/react-icons';
import { Link } from 'react-router-dom';

import { SurveyCard } from '../components/SurveyCard';
import { useSurveys } from '../hooks/useSurveys';


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
})

export const SurveysListPage = () => {
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
        <Link to="/admin/surveys/new">
          <Button appearance="primary" icon={<Add24Regular />}>
            Neue Umfrage
          </Button>
        </Link>
      </div>

      <div className={styles.grid}>
        {surveys?.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
      </div>

      {surveys?.length === 0 && (
        <Text>Noch keine Umfragen vorhanden.</Text>
      )}
    </div>
  )
}
