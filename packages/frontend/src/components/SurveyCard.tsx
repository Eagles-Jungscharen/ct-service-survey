import type { SurveyDto } from '@ct-service-survey/shared';
import { Card, CardHeader, Caption1, Subtitle1, makeStyles, tokens } from '@fluentui/react-components';
import React from 'react';
import { Link } from 'react-router-dom';

import { useFormattedDate } from '../hooks/useFormattedDate';

const useStyles = makeStyles({
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

    const surveyEndDate = useFormattedDate(survey.endDate);

    return (
        <Link
            to={`/admin/surveys/${survey.id}`}
            style={{ textDecoration: 'none' }}
        >
            <Card className={styles.card}>
                <CardHeader
                    header={<Subtitle1>{survey.title}</Subtitle1>}
                    description={<div>{surveyEndDate && <Caption1>Endet am: {surveyEndDate}</Caption1>}<Caption1>{survey.serviceName}</Caption1></div>}
                />
                <p>
                    {survey.description}
                    <div style={{ marginTop: '8px' }}>
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
                </p>
            </Card>
        </Link>
    );
};
