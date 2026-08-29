import { Button, Spinner, Text, makeStyles, tokens, Card, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger } from '@fluentui/react-components';
import {
  ArrowLeft24Regular,
  MoreVertical24Regular,
  Delete24Regular,
} from '@fluentui/react-icons';
import { useParams, Link } from 'react-router-dom';

import { ActivateSurveySection } from '../components/adminSurveyManagePage/ActivateSurveySection';
import { SurveyAccessSection } from '../components/adminSurveyManagePage/SurveyAccessSection';
import { SurveyBasicDataSection } from '../components/adminSurveyManagePage/SurveyBasicDataSection';
import { useSurvey, useUpdateSurvey, useDeleteServiceDate } from '../hooks/useSurveys';

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
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: tokens.spacingHorizontalL,
  }
});

export const AdminSurveyManagePage = () => {
  const styles = useStyles()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading } = useSurvey(id!)
  const updateMutation = useUpdateSurvey()
  const deleteServiceDateMutation = useDeleteServiceDate()

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
      <div className={styles.headerRow}>
        {/* Aktivierungssektion bei Draft-Status */}
        {survey.status === 'draft' && id && (
          <ActivateSurveySection id={id} />
        )}

        {/* TAG-Anzeige bei aktivierter Umfrage */}
        {survey.accessTag && (
          <SurveyAccessSection accessTag={survey.accessTag} />
        )}

        <SurveyBasicDataSection
          survey={survey}
        />
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
                  <MenuItem icon={<Delete24Regular />} onClick={() => void handleDeleteServiceDate(serviceDate.id)}>
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
