import type { ChurchToolsEventDto } from '@ct-service-survey/shared';
import { Checkbox, Input, InputOnChangeData } from '@fluentui/react-components';
import React from 'react';

import { SelectedEvent } from '../../models/CreateSurveyFormPayload';

interface EventTableRowProps {
    event: ChurchToolsEventDto;
    isSelected: boolean;
    notes: string;
    handleRemoveSelectedEvent: (eventId: number) => void;
    handleAddSelectedEvent: (event: SelectedEvent) => void;
    handleUpdateSelectedEventNotes: (eventId: number, notes: string) => void;
}

export const EventTableRow: React.FunctionComponent<EventTableRowProps> = (props: EventTableRowProps) => {
    const { event, isSelected, notes, handleRemoveSelectedEvent, handleAddSelectedEvent, handleUpdateSelectedEventNotes } = props;

    const updateNotesHandler = (_ev: React.ChangeEvent<HTMLInputElement, Element>, data: InputOnChangeData) => {
        handleUpdateSelectedEventNotes(event.id, data.value);
    };

    const formattedDate = React.useMemo(() => {
        console.log('event.startDate', event.startDate);
        return new Date(event.startDate).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }, [event.startDate]);

    const onToggleHandler = () => {
        if (isSelected) {
            handleRemoveSelectedEvent(event.id);
        } else {
            handleAddSelectedEvent({ event, notes: '' });
        }
    }

    return (
        <tr>
            <td style={{ padding: '8px' }}>
                <Checkbox checked={isSelected} onChange={onToggleHandler} />
            </td>
            <td style={{ padding: '8px' }}>{event.name}</td>
            <td style={{ padding: '8px' }}>
                {formattedDate}
            </td>
            <td style={{ padding: '8px' }}>
                <Input
                    value={notes}
                    onChange={updateNotesHandler}
                    disabled={!isSelected}
                    placeholder="Optionale Notizen..."
                />
            </td>
        </tr>
    );
};
