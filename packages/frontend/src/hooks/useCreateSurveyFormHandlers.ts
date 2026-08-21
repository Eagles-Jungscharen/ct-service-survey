import React from "react";
import { CreateSurveyFormPayload, SelectedEvent } from "../models/CreateSurveyFormPayload";

const INITIAL_FORM_PAYLOAD: CreateSurveyFormPayload = {
    title: '',
    description: '',
    status: 'draft',
    startDate: '',
    endDate: '',
    serviceId: undefined,
    selectedEvents: [],
};

export const useCreateSurveyFormHandlers = () => {
    const [createSurveyFormPayload, setCreateSurveyFormPayload] = React.useState<CreateSurveyFormPayload>(INITIAL_FORM_PAYLOAD);
    const handleTextChange = React.useCallback(
        (field: keyof CreateSurveyFormPayload, value: string) => {
         
            setCreateSurveyFormPayload((prev) => ({ ...prev, [field]: value }));
        },
        []
    );
    const handleStatusChange = React.useCallback(
        (value: CreateSurveyFormPayload['status']) => {
            setCreateSurveyFormPayload((prev) => ({ ...prev, status: value }));
        },
        []
    );
    const handleServiceIdChange = React.useCallback(
        (value: number | undefined) => {
            setCreateSurveyFormPayload((prev) => ({ ...prev, serviceId: value }));
        },
        []
    );
    const handleAddSelectedEvent = React.useCallback(
        (event: SelectedEvent) => {
            setCreateSurveyFormPayload((prev) => ({
                ...prev,
                selectedEvents: [...prev.selectedEvents, event],
            }));
        },
        []
    );
    const handleRemoveSelectedEvent = React.useCallback(
        (eventId: number) => {
            setCreateSurveyFormPayload((prev) => ({
                ...prev,
                selectedEvents: prev.selectedEvents.filter((e) => e.event.id !== eventId),
            }));
        },
        []
    );
    const handleUpdateSelectedEventNotes = React.useCallback(
        (eventId: number, notes: string) => {
            setCreateSurveyFormPayload((prev) => ({
                ...prev,
                selectedEvents: prev.selectedEvents.map((e) =>
                    e.event.id === eventId ? { ...e, notes } : e
                ),
            }));
        },
        []
    );
    return {
        createSurveyFormPayload,
        handleTextChange,
        handleStatusChange,
        handleServiceIdChange,
        handleAddSelectedEvent,
        handleRemoveSelectedEvent,
        handleUpdateSelectedEventNotes,
    };
};