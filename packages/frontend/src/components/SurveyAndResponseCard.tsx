import type { SurveyDto } from '@ct-service-survey/shared';
import { Body1, Button, Caption1, Card, CardFooter, CardHeader, Subtitle1, makeStyles, tokens } from '@fluentui/react-components';
import { TextBulletListSquareSparkleRegular } from '@fluentui/react-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useFormattedDate } from '../hooks/useFormattedDate';
import { useMyResponsesAnswerState } from '../hooks/useResponses';

const useStyles = makeStyles({
    card: {
        cursor: 'pointer',
        ':hover': {
            boxShadow: tokens.shadow8,
        },
    },
    statusBadgeContainer: {
        marginTop: tokens.spacingVerticalM,
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
    headerDescriptionContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    linkNoDecoration: {
        textDecoration: 'none',
    },
});

const statusLabels: Record<SurveyDto['status'], string> = {
    draft: 'Entwurf',
    active: 'Aktiv',
    closed: 'Geschlossen',
};

interface SurveyAndResponseCardProps {
    survey: SurveyDto;
}

export const SurveyAndResponseCard = (props: SurveyAndResponseCardProps) => {
    const { survey } = props;

    const styles = useStyles();
    const navigate = useNavigate();

    const surveyEndDate = useFormattedDate(survey.endDate);

    const { data: myResponsesAnswerState } = useMyResponsesAnswerState(survey.id);

    const processStatusText = React.useMemo(() => {
        if (!myResponsesAnswerState) {
            return '';
        }
        if (myResponsesAnswerState?.state === 'answered') {
            return 'Du hast bereits geantwortet';
        }
        if (myResponsesAnswerState?.state === 'inEditing') {
            return 'Du hast die Umfrage als Entwurf gespeichert';
        }
        return 'Du hast noch nicht geantwortet';
    }, [myResponsesAnswerState]);

    const handleOpen = React.useCallback(() => {
        void navigate(`/surveys/${survey.id}`);
    }, [navigate, survey.id]);

    return (
        <>
            <Card className={styles.card}>
                <CardHeader
                    header={<Subtitle1>{survey.title}</Subtitle1>}
                    description={<div className={styles.headerDescriptionContainer}>
                        {surveyEndDate && <Caption1>Endet am: {surveyEndDate}</Caption1>}
                        <Caption1>Dienst:{survey.serviceName}</Caption1>
                    </div>}
                />
                <div>
                    <div>{survey.description}</div>
                    <div><Body1>{processStatusText}</Body1></div>
                    <div className={styles.statusBadgeContainer}>
                        <span
                            className={`${styles.statusBadge} ${survey.status === 'draft'
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
                <CardFooter>
                    <Button appearance="primary" icon={<TextBulletListSquareSparkleRegular />} onClick={handleOpen}>Beantworten</Button>
                </CardFooter>
            </Card>
        </>
    );
};
