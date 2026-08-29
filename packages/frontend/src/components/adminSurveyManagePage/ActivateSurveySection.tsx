import { Button, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Rocket24Regular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

const useStyles = makeStyles({
    activateSection: {
        marginBottom: tokens.spacingVerticalXL,
        padding: tokens.spacingVerticalL,
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusXLarge,
        maxWidth: '595px',
    },
});

interface ActivateSurveySectionProps {
    id: string;
}

export const ActivateSurveySection = (props: ActivateSurveySectionProps) => {
    const { id } = props;
    const styles = useStyles();
    const navigate = useNavigate();

    const handleNavigateToActivate = () => {
        void navigate(`/admin/surveys/${id}/activate`)
    }

    return (
        <div className={styles.activateSection}>
            <Text size={500} weight="semibold" style={{ display: 'block', marginBottom: tokens.spacingVerticalS }}>
                Umfrage aktivieren
            </Text>
            <Text size={300} style={{ display: 'block', marginBottom: tokens.spacingVerticalM }}>
                Diese Umfrage ist noch im Entwurfsmodus. Aktivieren Sie sie, um Personen einzuladen und einen Zugriffs-TAG zu generieren.
            </Text>
            <Button
                icon={<Rocket24Regular />}
                appearance="primary"
                onClick={handleNavigateToActivate}
            >
                Umfrage aktivieren
            </Button>
        </div>
    );
};
