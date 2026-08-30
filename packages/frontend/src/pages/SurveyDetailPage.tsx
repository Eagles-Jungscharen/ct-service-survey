import type { AvailabilityStatus, ResponseDto, ServiceDateResponseRequest, SurveyDto } from '@ct-service-survey/shared'
import { Badge, Body1, Button, MessageBar, MessageBarBody, MessageBarTitle, Spinner, Subtitle1, Text, Title1, makeStyles, tokens, } from '@fluentui/react-components'
import { ArrowLeft24Regular } from '@fluentui/react-icons'
import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { ResponseServiceDateCard } from '../components/ResponseServiceDateCard'
import { useMyResponsesAnswerState, useMyResponses, useSubmitResponses } from '../hooks/useResponses'
import { useSurvey } from '../hooks/useSurveys'

const useStyles = makeStyles({
  container: {
    padding: tokens.spacingVerticalXXL,
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginTop: tokens.spacingVerticalM,
    marginBottom: tokens.spacingVerticalXL,
    display: 'flex',
    justifyContent: 'space-between',
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
  description: {
    marginBottom: tokens.spacingVerticalM,
  },
  actionButtons: {
    marginTop: tokens.spacingVerticalXL,
    display: 'flex',
    gap: tokens.spacingHorizontalM,
    justifyContent: 'flex-end',
  },
})

const statusLabels: Record<SurveyDto['status'], string> = {
  draft: 'Entwurf',
  active: 'Aktiv',
  closed: 'Geschlossen',
}

export const SurveyDetailPage: React.FunctionComponent = () => {
  const styles = useStyles();
  const { id } = useParams<{ id: string }>();
  const { data: survey, isLoading, error } = useSurvey(id!);
  const { data: myResponses, isLoading: myResponsesLoading } = useMyResponses(id!);
  const { data: myResponsesAnswerState, isLoading: myResponsesAnswerStateLoading } = useMyResponsesAnswerState(id!);
  const submitMutation = useSubmitResponses();


  const [prvMyResponses, setPrvMyResponses] = React.useState<ResponseDto[]>();
  const [prvSurvey, setPrvSurvey] = React.useState<SurveyDto>();
  const [currentResponses, setCurrentResponses] = React.useState<Record<string, AvailabilityStatus>>({});

  const isReadOnly = React.useMemo(() => myResponsesAnswerState?.state === 'answered' || survey?.status === 'closed', [myResponsesAnswerState, survey]);
  const myStatusText = React.useMemo(() => {
    if (myResponsesAnswerState?.state === 'answered') {
      return 'Du hast bereits geantwortet';
    }
    if (survey?.status === 'closed') {
      return 'Die Umfrage ist geschlossen';
    }
    return 'Die Umfrage ist noch offen, und du hast noch nicht geantwortet';
  }, [myResponsesAnswerState, survey]);
  const isValidForAnswer = React.useMemo(() => {
    return Object.values(currentResponses).every((status) => status !== 'unknown');
  }, [currentResponses]);


  if (prvMyResponses !== myResponses || prvSurvey !== survey) {
    setPrvMyResponses(myResponses);
    setPrvSurvey(survey);
    if (survey && myResponses) {
      const newCurrentResponses: Record<string, AvailabilityStatus> = {}
      survey.dates.forEach((serviceDate) => {
        const response = myResponses.find((r) => r.serviceDateId === serviceDate.id)
        newCurrentResponses[serviceDate.id] = response?.availability ?? 'unknown'
      })
      setCurrentResponses(newCurrentResponses)
    }
  }

  const handleResponseChange = (id: string, newResponse: AvailabilityStatus) => {
    setCurrentResponses((prev) => ({
      ...prev,
      [id]: newResponse,
    }));
  };

  const handleResponseInEditingSubmit = React.useCallback(() => {
    if (!survey) {
      return;
    }
    const responsesToSubmit: ServiceDateResponseRequest[] = Object.entries(currentResponses).map(([serviceDateId, availability]) => ({
      serviceDateId,
      availability,
      remarks: '',
    }));
    void submitMutation.mutate({ surveyId: survey.id, responses: responsesToSubmit, state: 'inEditing' });
  }, [currentResponses, submitMutation, survey]);

  const handleResponseSubmitted = React.useCallback(() => {
    if (!survey) {
      return;
    }
    const responsesToSubmit: ServiceDateResponseRequest[] = Object.entries(currentResponses).map(([serviceDateId, availability]) => ({
      serviceDateId,
      availability,
      remarks: '',
    }));
    void submitMutation.mutate({ surveyId: survey.id, responses: responsesToSubmit, state: 'answered' });
  }, [currentResponses, submitMutation, survey]);


  if (isLoading || myResponsesLoading || myResponsesAnswerStateLoading) {
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

  return (
    <div className={styles.container}>
      <div className={styles.backButton}>
        <Link to="/surveys">
          <Button icon={<ArrowLeft24Regular />}>Zurück zur Liste</Button>
        </Link>
      </div>
      {myStatusText && (
        <MessageBar>
          <MessageBarBody>
            <MessageBarTitle>Info:</MessageBarTitle>
            {myStatusText}
          </MessageBarBody>
        </MessageBar>
      )}
      <div className={styles.header}>
        <div><Title1>{survey.title}</Title1></div>
        <Badge appearance="filled" color="brand" size="large">
          {statusLabels[survey.status]}
        </Badge>
      </div>
      <div className={styles.description}>
        <Body1>{survey.description}</Body1>
      </div>

      <div className={styles.section}>
        <Subtitle1>Dienste</Subtitle1>
        {survey.dates.map((serviceDate) => {
          const myResponse = currentResponses[serviceDate.id]

          return (
            <ResponseServiceDateCard
              key={serviceDate.id}
              serviceDate={serviceDate}
              myResponse={myResponse}
              onResponseChange={handleResponseChange}
              readOnly={isReadOnly}
            />
          )
        })}
        {survey.dates.length === 0 && (
          <Text>Noch keine Dienste definiert.</Text>
        )}
      </div>

      <div className={styles.actionButtons}>
        <Button disabled={isReadOnly} onClick={handleResponseInEditingSubmit}>Als Entwurf speichern</Button>
        <Button appearance="primary" disabled={isReadOnly || !isValidForAnswer} onClick={handleResponseSubmitted}>Verfügbarkeit melden</Button>
      </div>
    </div>

  )
}
