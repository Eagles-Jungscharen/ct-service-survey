import type { ResponseDto, ServiceDateDto, SurveyStatus } from '@ct-service-survey/shared';
import { Body1, Button, Card, CardHeader, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Subtitle2 } from '@fluentui/react-components';
import { Delete24Regular, MoreVertical24Regular } from '@fluentui/react-icons';
import React from 'react';

import { useFormattedDate } from '../hooks/useFormattedDate';
import { useFormattedTime } from '../hooks/useFormattedTime';
import { ResponseSummary } from './adminSurveyManagePage/ResponseSummary';

interface ServiceDateCardProps {
    serviceDate: ServiceDateDto;
    surveyStatus: SurveyStatus;
    currentResponses: ResponseDto[];
    onDelete: (serviceDateId: string) => void;
}

export const ServiceDateCard = (props: ServiceDateCardProps) => {
    const { serviceDate, onDelete, surveyStatus } = props;

    const formattedDate = useFormattedDate(serviceDate.date);
    const formattedTime = useFormattedTime(serviceDate.date);

    const handleDelete = React.useCallback(() => {
        void onDelete(serviceDate.id);
    }, [onDelete, serviceDate.id]);

    return (
        <Card>
            <CardHeader
                header={<Subtitle2>{formattedDate + ' ' + formattedTime}</Subtitle2>}
                description={<Body1>{serviceDate.eventName}</Body1>}
                action={surveyStatus === 'draft' ? <Menu>
                    <MenuTrigger disableButtonEnhancement>
                        <Button icon={<MoreVertical24Regular />} appearance="subtle" />
                    </MenuTrigger>
                    <MenuPopover>
                        <MenuList>
                            <MenuItem icon={<Delete24Regular />} onClick={handleDelete}>
                                Löschen
                            </MenuItem>
                        </MenuList>
                    </MenuPopover>
                </Menu> : undefined} />
            {props.currentResponses.length > 0 && (
                <ResponseSummary
                    currentResponses={props.currentResponses}
                />
            )}
        </Card>
    );
};
