import type { FetchEventsRequest, FetchEventsResponse, SurveyStatus } from '@ct-service-survey/shared'
import { Button, Input, Textarea, makeStyles, tokens, Text, Spinner, Dropdown, Option, Field, InputOnChangeData, } from '@fluentui/react-components'
import type { UseMutationResult } from '@tanstack/react-query'
import React from 'react'
import { Link } from 'react-router-dom'

import { CreateSurveyFormPayload } from '../../models/CreateSurveyFormPayload'

const useStyles = makeStyles({
    formGroup: {
        marginBottom: tokens.spacingVerticalM,
    },
    dateGroup: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: tokens.spacingHorizontalM,
    },
    actions: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalXL,
    },
    errorText: {
        color: tokens.colorPaletteRedForeground1,
        marginTop: tokens.spacingVerticalM,
    },
    formContainer: {
        display: 'flex',
        flexDirection: 'column',
        rowGap: tokens.spacingVerticalM,
    },
})

const statusLabels: Record<SurveyStatus, string> = {
    draft: 'Entwurf',
    active: 'Aktiv',
    closed: 'Geschlossen',
}

interface Service {
    id: number
    name: string
}

interface Step1FormProps {
    createSurveyFormPayload: CreateSurveyFormPayload;
    services: Service[] | undefined;
    servicesLoading: boolean;
    fetchEventsMutation: UseMutationResult<FetchEventsResponse, Error, FetchEventsRequest, unknown>;
    onFetchEvents: () => void;
    handleTextChange: (field: keyof CreateSurveyFormPayload, value: string) => void;
    handleStatusChange: (value: SurveyStatus) => void;
    handleServiceIdChange: (value: number | undefined) => void;
}

export const Step1Form: React.FunctionComponent<Step1FormProps> = (props: Step1FormProps) => {
    const styles = useStyles()

    const { createSurveyFormPayload, services, servicesLoading, fetchEventsMutation, onFetchEvents, handleTextChange, handleStatusChange, handleServiceIdChange } = props

    const selectedServiceName = React.useMemo(() => {
        return createSurveyFormPayload.serviceId !== null
            ? services?.find((s) => s.id === createSurveyFormPayload.serviceId)?.name ?? 'Unbekannt'
            : 'Unbekannt';
    }, [createSurveyFormPayload.serviceId, services]);

    const isDisabled = React.useMemo(() => {
        return (
            !createSurveyFormPayload.title ||
            !createSurveyFormPayload.startDate ||
            !createSurveyFormPayload.endDate ||
            !createSurveyFormPayload.serviceId ||
            fetchEventsMutation.isPending
        );
    }, [createSurveyFormPayload.title, createSurveyFormPayload.startDate, createSurveyFormPayload.endDate, createSurveyFormPayload.serviceId, fetchEventsMutation.isPending]);

    const updateTitle = React.useCallback((_ev: React.ChangeEvent<HTMLInputElement, Element>, data: InputOnChangeData) => {
        handleTextChange('title', data.value);
    }, [handleTextChange]);

    const updateDescription = React.useCallback((_ev: React.ChangeEvent<HTMLTextAreaElement, Element>, data: InputOnChangeData) => {
        handleTextChange('description', data.value);
    }, [handleTextChange]);

    const updateStatus = React.useCallback((value: SurveyStatus) => {
        handleStatusChange(value);
    }, [handleStatusChange]);

    const updateStartDate = React.useCallback((_ev: React.ChangeEvent<HTMLInputElement, Element>, data: InputOnChangeData) => {
        handleTextChange('startDate', data.value);
    }, [handleTextChange]);
    const updateEndDate = React.useCallback((_ev: React.ChangeEvent<HTMLInputElement, Element>, data: InputOnChangeData) => {
        handleTextChange('endDate', data.value);
    }, [handleTextChange]);

    const updateSelectedServiceId = React.useCallback((value: number | null) => {
        handleServiceIdChange(value ?? undefined);
    }, [handleServiceIdChange]);

    return (
        <div className={styles.formContainer}>
            <Field label="Title der Umfrag" required>
                <Input
                    id="title"
                    value={createSurveyFormPayload.title}
                    onChange={updateTitle}
                    required
                    placeholder="z.B. Lobpreis-Dienste Januar 2026"
                />
            </Field>
            <Field label="Beschreibung" hint="Optional: Weitere Informationen zur Umfrage">
                <Textarea
                    id="description"
                    value={createSurveyFormPayload.description}
                    onChange={updateDescription}
                    resize="vertical"
                    placeholder="Weitere Informationen zur Umfrage..."
                />
            </Field>
            <Field label="Status" required>
                <Dropdown
                    placeholder="Status auswählen..."
                    value={statusLabels[createSurveyFormPayload.status]}
                    selectedOptions={[createSurveyFormPayload.status]}
                    onOptionSelect={(_, data) =>
                        updateStatus(data.optionValue as SurveyStatus)
                    }
                >
                    {(Object.keys(statusLabels) as SurveyStatus[]).map((s) => (
                        <Option key={s} value={s}>
                            {statusLabels[s]}
                        </Option>
                    ))}
                </Dropdown>
            </Field>
            <Field label="Start-Datum" required>
                <Input
                    id="startDate"
                    type="date"
                    value={createSurveyFormPayload.startDate}
                    onChange={updateStartDate}
                    required
                />
            </Field>
            <Field label="End-Datum" required>
                <Input
                    id="endDate"
                    type="date"
                    onChange={updateEndDate}
                    value={createSurveyFormPayload.endDate}
                    required
                />
            </Field>
            <Field label="Dienst" required>
                {servicesLoading ? (
                    <Spinner size="small" label="Lade Dienste..." />
                ) : (
                    <Dropdown
                        placeholder="Dienst auswählen..."
                        value={selectedServiceName}
                        selectedOptions={createSurveyFormPayload.serviceId ? [String(createSurveyFormPayload.serviceId)] : []}
                        onOptionSelect={(_, data) =>
                            updateSelectedServiceId(data.optionValue ? Number(data.optionValue) : null)
                        }
                    >
                        {services?.map((service) => (
                            <Option key={service.id} value={String(service.id)}>
                                {service.name}
                            </Option>
                        ))}
                    </Dropdown>
                )}
            </Field>
            <div className={styles.actions}>
                <Button
                    appearance="primary"
                    onClick={onFetchEvents}
                    disabled={isDisabled}
                >
                    {fetchEventsMutation.isPending ? 'Lädt Events...' : 'Weiter'}
                </Button>
                <Link to="/admin/surveys">
                    <Button>Abbrechen</Button>
                </Link>
            </div>

            {fetchEventsMutation.isError && (
                <Text className={styles.errorText}>
                    Fehler beim Abrufen der Events: {fetchEventsMutation.error.message}
                </Text>
            )}
        </div>
    )
}
