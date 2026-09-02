import { Button, Spinner, Text, makeStyles, tokens } from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
} from '@fluentui/react-icons';
import { useParams, Link } from 'react-router-dom';

import { ActivateSurveySection } from '../components/adminSurveyManagePage/ActivateSurveySection';
import { InvityAndResponseStatus } from '../components/adminSurveyManagePage/InvityAndResponseStatus';
import { SurveyAccessSection } from '../components/adminSurveyManagePage/SurveyAccessSection';
import { SurveyBasicDataSection } from '../components/adminSurveyManagePage/SurveyBasicDataSection';
import { ServiceDateCard } from '../components/ServiceDateCard';
import { useAllResponses, useAllResponsesAnswerState } from '../hooks/useResponses';
import { useSurvey, useDeleteServiceDate } from '../hooks/useSurveys';

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
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalL,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalL,
  },
  sectionHeaderLeft: {
    marginBottom: tokens.spacingVerticalXL,
    maxWidth: '600px',
    width: '100%',
  },
});

export const AdminSurveyManagePage = () => {
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading } = useSurvey(id!)
  const { data: allResponsesAnswerState, isLoading: isLoadingAllResponsesAnswerState } = useAllResponsesAnswerState(id!);
  const { data: allResponse, isLoading: isLoadingAllResponses } = useAllResponses(id!)

  const deleteServiceDateMutation = useDeleteServiceDate()

  const handleDeleteServiceDate = (serviceDateId: string) => {
    if (!id || !confirm('Dienst wirklich löschen?')) return

    void deleteServiceDateMutation.mutateAsync({
      surveyId: id,
      serviceDateId,
    })
  }

  if (isLoading || isLoadingAllResponsesAnswerState || isLoadingAllResponses) {
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
      <div className={styles.headerRow}>
        <div className={styles.sectionHeaderLeft}>
          {/* Aktivierungssektion bei Draft-Status */}
          {survey.status === 'draft' && id && (
            <ActivateSurveySection id={id} />
          )}

          {/* TAG-Anzeige bei aktivierter Umfrage */}
          {survey.accessTag && (
            <SurveyAccessSection accessTag={survey.accessTag} />
          )}
          {survey.status !== 'draft' && id && allResponsesAnswerState && (
            <InvityAndResponseStatus
              invitedPeopleIds={survey.invitedPersonIds!}
              allResponsesAnswerState={allResponsesAnswerState}
            />
          )}
        </div>
        <SurveyBasicDataSection
          survey={survey}
        />
      </div>
      <div className={styles.section}>
        <h2>Dienste</h2>

        {survey.dates.map((serviceDate) => (
          <ServiceDateCard
            key={serviceDate.id}
            serviceDate={serviceDate}
            onDelete={handleDeleteServiceDate}
            surveyStatus={survey.status}
            currentResponses={allResponse ? allResponse.filter(response => response.serviceDateId === serviceDate.id) : []}
          />
        ))}

        {survey.dates.length === 0 && (
          <Text>Noch keine Dienste definiert.</Text>
        )}
      </div>

      <div className={styles.actions}>
        <Link to={`/admin/surveys/${id}/assignments`}>
          <Button>Zu Einteilungen</Button>
        </Link>
      </div>
    </div>
  )
}
