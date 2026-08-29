import type { ServiceDateDto, SurveyStatus } from '@ct-service-survey/shared';
import { Body1, Button, Card, CardHeader, Menu, MenuItem, MenuList, MenuPopover, MenuTrigger, Subtitle2, Text, makeStyles, tokens } from '@fluentui/react-components';
import { Delete24Regular, MoreVertical24Regular } from '@fluentui/react-icons';
import React from 'react';

import { useFormattedDate } from '../hooks/useFormattedDate';
import { useFormattedTime } from '../hooks/useFormattedTime';

interface ServiceDateCardProps {
    serviceDate: ServiceDateDto;
    surveyStatus: SurveyStatus;
    onDelete: (serviceDateId: string) => void;
}

export const ServiceDateCard = (props: ServiceDateCardProps) => {
    const { serviceDate, onDelete, surveyStatus } = props;

    const formattedDate = useFormattedDate(serviceDate.date);
    const formattedTime = useFormattedTime(serviceDate.date);

    const handleDelete = React.useCallback(() => {
        void onDelete(serviceDate.id);
    }, [onDelete, serviceDate.id]);
    console.log('Rendering ServiceDateCard for serviceDate.id:', serviceDate.id);
    console.log('Formatted date:', formattedDate);
    console.log('Formatted time:', formattedTime);

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
        </Card>
    );
};
