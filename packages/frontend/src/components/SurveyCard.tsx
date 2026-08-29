import type { SurveyDto } from '@ct-service-survey/shared';
import { Button, Caption1, Card, CardFooter, CardHeader, Subtitle1, makeStyles, tokens } from '@fluentui/react-components';
import { CheckmarkRegular, DeleteRegular, OpenRegular } from '@fluentui/react-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { useFormattedDate } from '../hooks/useFormattedDate';
import { useCloseSurvey, useDeleteSurvey } from '../hooks/useSurveys';

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

interface SurveyCardProps {
    survey: SurveyDto;
}

export const SurveyCard = ({ survey }: SurveyCardProps) => {
    const styles = useStyles();
    const navigate = useNavigate();

    const deleteSurvey = useDeleteSurvey();
    const closeSurvey = useCloseSurvey();

    const surveyEndDate = useFormattedDate(survey.endDate);

    const handleOpen = React.useCallback(() => {
        void navigate(`/admin/surveys/${survey.id}`);
    }, [navigate, survey.id]);

    const canBeDeleted = React.useMemo(() => survey.status !== 'active', [survey.status]);
    const canBeClosed = React.useMemo(() => survey.status === 'active', [survey.status]);


    const handleDelete = React.useCallback(() => {
        void deleteSurvey.mutateAsync(survey.id);
    }, [deleteSurvey, survey.id]);

    const handleClose = React.useCallback(() => {
        void closeSurvey.mutateAsync({ surveyId: survey.id });
    }, [closeSurvey, survey.id]);
    return (
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
                <Button icon={<DeleteRegular />} onClick={handleDelete} disabled={!canBeDeleted}>Löschen</Button>
                <Button icon={<CheckmarkRegular />} onClick={handleClose} disabled={!canBeClosed}>Abschließen</Button>
                <Button appearance="primary" icon={<OpenRegular />} onClick={handleOpen}>Öffnen</Button>
            </CardFooter>
        </Card>
    );
};
