import type { SurveyDto } from '@ct-service-survey/shared';
import { Button, Field, Input, InputOnChangeData, Spinner, Subtitle1, Textarea, makeStyles, tokens } from '@fluentui/react-components';
import React, { useState } from 'react';

import { useUpdateSurvey } from '../../hooks/useSurveys';

const useStyles = makeStyles({
    dataSection: {
        marginBottom: tokens.spacingVerticalXL,
        padding: tokens.spacingVerticalL,
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusXLarge,
        maxWidth: '595px',
        width: '100%',
    },
    formGroup: {
        marginBottom: tokens.spacingVerticalM,
    },
    actionBar: {
        display: 'flex',
        justifyContent: 'flex-end',
    },
});


interface SurveyBasicDataSectionProps {
    survey: SurveyDto;
}

export const SurveyBasicDataSection = (props: SurveyBasicDataSectionProps) => {
    const { survey } = props;
    const styles = useStyles();
    const updateMutation = useUpdateSurvey();

    const [prvSurvey, setPrvSurvey] = useState(survey);
    const [title, setTitle] = useState(survey.title);
    const [description, setDescription] = useState(survey.description);

    if (survey !== prvSurvey) {
        setPrvSurvey(survey);
        setTitle(survey.title);
        setDescription(survey.description);
    }

    const onTitleChange = (_ev: React.ChangeEvent<HTMLInputElement, Element>, data: InputOnChangeData) => {
        setTitle(data.value);
    };

    const processIcon = React.useMemo(() => updateMutation.isPending ? <Spinner size="tiny" /> : undefined, [updateMutation.isPending]);

    const isNotDirty = React.useMemo(() => title === survey.title && description === survey.description, [title, description, survey.title, survey.description]);

    const onDescriptionChange = (_ev: React.ChangeEvent<HTMLTextAreaElement, Element>, data: InputOnChangeData) => {
        setDescription(data.value);
    };
    const handleUpdate = React.useCallback(() => {
        if (!survey.id) return

        const updateAsync = async () => {
            await updateMutation.mutateAsync({
                id: survey.id,
                data: {
                    title,
                    description,
                    status: survey.status,
                },
            });
        };
        void updateAsync();

    }, [survey.id, title, description, survey.status, updateMutation]);

    return (
        <div className={styles.dataSection}>
            <Subtitle1>Grunddaten</Subtitle1>

            <div className={styles.formGroup}>
                <Field label="Titel">
                    <Input
                        id="title"
                        value={title}
                        onChange={onTitleChange}
                    />
                </Field>
            </div>

            <div className={styles.formGroup}>
                <Field label="Beschreibung">
                    <Textarea
                        id="description"
                        value={description}
                        onChange={onDescriptionChange}
                        resize="vertical"
                    />
                </Field>
            </div>
            <div className={styles.actionBar}>
                <Button icon={processIcon} appearance="primary" onClick={handleUpdate} disabled={updateMutation.isPending || isNotDirty}>Aktualisieren</Button>
            </div>
        </div>
    );
};
