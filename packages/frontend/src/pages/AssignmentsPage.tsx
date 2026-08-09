import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  Button,
  Spinner,
  Text,
  makeStyles,
  tokens,
  Card,
  CardHeader,
  Checkbox,
} from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import { useSurvey } from '../hooks/useSurveys'
import { useAllResponses } from '../hooks/useResponses'
import { useSurveyAssignments, useSubmitAssignments } from '../hooks/useAssignments'
import type { ServiceDateAssignmentRequest } from '@ct-service-survey/shared'

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
  serviceDateCard: {
    marginBottom: tokens.spacingVerticalXL,
  },
  responsesList: {
    marginTop: tokens.spacingVerticalM,
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  responseItem: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  availabilityBadge: {
    padding: '2px 8px',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase200,
  },
  availabilityYes: {
    backgroundColor: tokens.colorPaletteGreenBackground2,
    color: tokens.colorPaletteGreenForeground2,
  },
  availabilityMaybe: {
    backgroundColor: tokens.colorPaletteYellowBackground2,
    color: tokens.colorPaletteYellowForeground2,
  },
  actions: {
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    marginTop: tokens.spacingVerticalXL,
  },
})

export function AssignmentsPage() {
  const styles = useStyles()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { data: survey, isLoading: surveyLoading } = useSurvey(id!)
  const { data: responses, isLoading: responsesLoading } = useAllResponses(id!)
  const { data: existingAssignments } = useSurveyAssignments(id!)
  const submitMutation = useSubmitAssignments()

  // State: Map von serviceDateId zu Set von userIds
  const [assignments, setAssignments] = useState<Map<string, Set<string>>>(new Map())

  // Bestehende Einteilungen in State laden
  useState(() => {
    if (existingAssignments) {
      const assignmentMap = new Map<string, Set<string>>()
      existingAssignments.forEach((assignment) => {
        const existing = assignmentMap.get(assignment.serviceDateId) || new Set<string>()
        existing.add(assignment.userId)
        assignmentMap.set(assignment.serviceDateId, existing)
      })
      setAssignments(assignmentMap)
    }
  })

  const handleToggleAssignment = (serviceDateId: string, userId: string) => {
    setAssignments((prev) => {
      const newMap = new Map(prev)
      const existing = newMap.get(serviceDateId) || new Set<string>()
      const newSet = new Set(existing)
      
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      
      newMap.set(serviceDateId, newSet)
      return newMap
    })
  }

  const handleSave = async () => {
    if (!id) return

    const assignmentRequests: ServiceDateAssignmentRequest[] = []
    assignments.forEach((userIds, serviceDateId) => {
      assignmentRequests.push({
        serviceDateId,
        userIds: Array.from(userIds),
      })
    })

    await submitMutation.mutateAsync({
      surveyId: id,
      assignments: assignmentRequests,
    })

    navigate('/admin/surveys')
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

  // Antworten nach ServiceDate gruppieren
  const responsesByServiceDate = new Map<string, typeof responses>()
  responses?.forEach((response) => {
    const existing = responsesByServiceDate.get(response.serviceDateId) || []
    responsesByServiceDate.set(response.serviceDateId, [...existing, response])
  })

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link to={`/admin/surveys/${id}`}>
          <Button icon={<ArrowLeft24Regular />}>Zurück zur Bearbeitung</Button>
        </Link>
      </div>

      <div className={styles.header}>
        <h1>Einteilungen vornehmen</h1>
        <Text>{survey.title}</Text>
      </div>

      {survey.dates.map((serviceDate) => {
        const serviceDateResponses = responsesByServiceDate.get(serviceDate.id) || []
        const assignedUsers = assignments.get(serviceDate.id) || new Set<string>()

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
                  <Text size={200} style={{ display: 'block', marginTop: '4px' }}>
                    Eingeteilt: {assignedUsers.size} Personen
                  </Text>
                </div>
              }
            />

            <div className={styles.responsesList}>
              {serviceDateResponses.map((response) => (
                <div key={response.userId} className={styles.responseItem}>
                  <Checkbox
                    checked={assignedUsers.has(response.userId)}
                    onChange={() => handleToggleAssignment(serviceDate.id, response.userId)}
                  />
                  <Text>{response.userName}</Text>
                  <span
                    className={`${styles.availabilityBadge} ${
                      response.availability === 'yes'
                        ? styles.availabilityYes
                        : response.availability === 'maybe'
                        ? styles.availabilityMaybe
                        : ''
                    }`}
                  >
                    {response.availability === 'yes'
                      ? 'Kann'
                      : response.availability === 'no'
                      ? 'Kann nicht'
                      : response.availability === 'maybe'
                      ? 'Vielleicht'
                      : 'Unbekannt'}
                  </span>
                  {response.remarks && (
                    <Text size={200} style={{ fontStyle: 'italic' }}>
                      {response.remarks}
                    </Text>
                  )}
                </div>
              ))}
              {serviceDateResponses.length === 0 && (
                <Text>Noch keine Rückmeldungen vorhanden.</Text>
              )}
            </div>
          </Card>
        )
      })}

      <div className={styles.actions}>
        <Button
          appearance="primary"
          onClick={handleSave}
          disabled={submitMutation.isPending}
        >
          {submitMutation.isPending ? 'Wird gespeichert...' : 'Einteilungen speichern'}
        </Button>
        <Link to="/admin/surveys">
          <Button>Abbrechen</Button>
        </Link>
      </div>

      {submitMutation.isError && (
        <Text style={{ color: tokens.colorPaletteRedForeground1 }}>
          Fehler: {submitMutation.error.message}
        </Text>
      )}
    </div>
  )
}
