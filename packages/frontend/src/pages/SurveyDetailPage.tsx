import type { SurveyDto } from '@ct-service-survey/shared'
import { Button, Spinner, Text, makeStyles, tokens, } from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useParams, Link } from 'react-router-dom'

import { ResponseServiceDateCard } from '../components/ResponseServiceDateCard'
import { useMyResponses } from '../hooks/useResponses'
import { useSurvey } from '../hooks/useSurveys'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: tokens.spacingVerticalXL,
  },
  backButton: {
    marginBottom: tokens.spacingVerticalM,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: tokens.borderRadiusMedium,
    fontSize: tokens.fontSizeBase200,
    fontWeight: tokens.fontWeightSemibold,
    marginLeft: tokens.spacingHorizontalM,
  },
  section: {
    marginBottom: tokens.spacingVerticalXL,
  },
})

const statusLabels: Record<SurveyDto['status'], string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  closed: 'Geschlossen',
}

export function SurveyDetailPage() {
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading, error } = useSurvey(id!)
  const { data: myResponses } = useMyResponses(id!)

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Spinner label="Umfrage wird geladen..." />
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className={styles.container}>
        <Text>Fehler beim Laden der Umfrage: {error?.message}</Text>
      </div>
    )
  }

  // ResponseDto hat eine Map von serviceDateId zu AvailabilityStatus
  const responseMap = new Map(
    myResponses?.map((r) => [r.serviceDateId, r.availability]) ?? []
  )

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link to="/surveys">
          <Button icon={<ArrowLeft24Regular />}>Zurück zur Liste</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <h1>
          {survey.title}
          <span className={styles.statusBadge}>
            {statusLabels[survey.status]}
          </span>
        </h1>
        <Text>{survey.description}</Text>
      </div>

      <div className={styles.section}>
        <h2>Dienste</h2>
        {survey.dates.map((serviceDate) => {
          const myResponse = responseMap.get(serviceDate.id)

          return (
            <ResponseServiceDateCard
              key={serviceDate.id}
              serviceDate={serviceDate}
              myResponse={myResponse ?? 'unknown'}
              onResponseChange={(newResponse) => {
                responseMap.set(serviceDate.id, newResponse)
              }}
            />
          )
        })}
        {survey.dates.length === 0 && (
          <Text>Noch keine Dienste definiert.</Text>
        )}
      </div>

      {survey.status === 'active' && (
        <Link to={`/surveys/${id}/respond`}>
          <Button appearance="primary">Verfügbarkeit melden</Button>
        </Link>
      )}
    </div>
  )
}
