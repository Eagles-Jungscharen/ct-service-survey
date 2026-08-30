import { Button, Spinner, Text, Title1, makeStyles, tokens } from '@fluentui/react-components';
import { Edit24Regular } from '@fluentui/react-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { SurveyAndResponseCard } from '../components/SurveyAndResponseCard';
import { useInvitedSurveys } from '../hooks/useSurveys';


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
    buttonContainer: {
        marginBottom: tokens.spacingVerticalL,
    },
    grid: {
        marginTop: tokens.spacingVerticalL,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: tokens.spacingHorizontalL,
    },
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXXL,
        color: tokens.colorNeutralForeground3,
    },
})

export const MySurveysListPage: React.FunctionComponent = () => {
    const styles = useStyles();
    const navigate = useNavigate();
    const { data: surveys, isLoading, error } = useInvitedSurveys();

    const handleOpenByTag = React.useCallback(() => {
        void navigate('/survey');
    }, [navigate]);

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
                <div>
                    <Title1>Meine Umfragen</Title1>
                </div>
                <div className={styles.buttonContainer}>
                    <Button
                        appearance="primary"
                        icon={<Edit24Regular />}
                        onClick={handleOpenByTag}
                    >
                        SurveyTag eingeben
                    </Button>
                </div>
            </div>


            <div className={styles.grid}>
                {surveys?.map((survey) => (
                    <SurveyAndResponseCard key={survey.id} survey={survey} />
                ))}
            </div>

            {surveys?.length === 0 && (
                <div className={styles.emptyState}>
                    <Text size={500}>Keine Umfragen gefunden</Text>
                    <br />
                    <Text>Du wurdest noch zu keinen Umfragen eingeladen.</Text>
                </div>
            )}
        </div>
    )
}
