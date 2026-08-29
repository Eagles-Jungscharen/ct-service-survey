import { Button, Field, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Copy24Regular, Share24Regular } from '@fluentui/react-icons';
import React from 'react';

const useStyles = makeStyles({
    section: {
        marginBottom: tokens.spacingVerticalXL,
        maxWidth: '600px',
        width: '100%',
    },
    formGroup: {
        marginBottom: tokens.spacingVerticalM,
    },
    tagDisplay: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    tagCode: {
        fontFamily: 'monospace',
        fontSize: '18px',
        fontWeight: 'bold',
        letterSpacing: '2px',
    },
});

interface SurveyAccessSectionProps {
    accessTag: string;
}

export const SurveyAccessSection = ({ accessTag }: SurveyAccessSectionProps) => {
    const styles = useStyles();

    const handleCopyTag = React.useCallback(() => {
        void navigator.clipboard.writeText(accessTag);
    }, [accessTag]);

    const handleShareLink = React.useCallback(() => {
        const link = `${window.location.origin}/survey/${accessTag}`;
        void navigator.clipboard.writeText(link);
    }, [accessTag]);

    return (
        <div className={styles.section}>
            <h2>Zugriff</h2>

            <div className={styles.formGroup}>
                <Field label="Zugriffs-TAG" hint="Personen können mit diesem TAG auf die Umfrage zugreifen">
                    <div className={styles.tagDisplay}>
                        <Text className={styles.tagCode}>{accessTag}</Text>
                        <Button
                            icon={<Copy24Regular />}
                            onClick={handleCopyTag}
                            appearance="subtle"
                            size="small"
                        >
                            Kopieren
                        </Button>
                    </div>
                </Field>
            </div>

            <div className={styles.formGroup}>
                <Button
                    icon={<Share24Regular />}
                    onClick={handleShareLink}
                    appearance="secondary"
                >
                    Link teilen (kopieren)
                </Button>
            </div>
        </div>
    );
};
