import type { AvailabilityStatus, ServiceDateDto } from '@ct-service-survey/shared';
import { Body1, Card, CardHeader, Dropdown, Option, OptionOnSelectData, SelectionEvents, Subtitle2, makeStyles, mergeClasses, tokens, } from '@fluentui/react-components';
import React from 'react';

import { useFormattedDate } from '../hooks/useFormattedDate';
import { useFormattedTime } from '../hooks/useFormattedTime';

const availabilityLabels: Record<AvailabilityStatus, string> = {
    yes: 'Ja',
    no: 'Nein',
    maybe: 'Vielleicht',
    unknown: 'Keine Angabe',
} as const;

const useStyles = makeStyles({
    card: {
        marginBottom: tokens.spacingVerticalM,
    },
    cardYes: {
        backgroundColor: `color-mix(in srgb, ${tokens.colorPaletteGreenBackground3} 30%, transparent)`,
    },
    cardNo: {
        backgroundColor: `color-mix(in srgb, ${tokens.colorPaletteRedBackground3} 30%, transparent)`,
    },
    cardMaybe: {
        backgroundColor: `color-mix(in srgb, ${tokens.colorPaletteYellowBackground3} 30%, transparent)`,
    },
    cardUnknown: {
        backgroundColor: tokens.colorNeutralBackground3,
    },
});

interface ResponseServiceDateCardProps {
    serviceDate: ServiceDateDto;
    myResponse: AvailabilityStatus;
    onResponseChange: (id: string, newResponse: AvailabilityStatus) => void;
    readOnly: boolean;
}


export const ResponseServiceDateCard: React.FunctionComponent<ResponseServiceDateCardProps> = (props: ResponseServiceDateCardProps) => {
    const { serviceDate, myResponse, onResponseChange, readOnly } = props;
    const styles = useStyles();

    const formattedDate = useFormattedDate(serviceDate.date);
    const formattedTime = useFormattedTime(serviceDate.date);

    const responseValue = React.useMemo(() => {
        return availabilityLabels[myResponse];
    }, [myResponse]);

    const selectedOption = React.useMemo(() => {
        return [myResponse];
    }, [myResponse]);

    const cardBGColorClass = React.useMemo(() => {
        switch (myResponse) {
            case 'yes':
                return styles.cardYes;
            case 'no':
                return styles.cardNo;
            case 'maybe':
                return styles.cardMaybe;
            case 'unknown':
            default:
                return styles.cardUnknown;
        }
    }, [myResponse, styles]);

    const handleOptionSelect = (_ev: SelectionEvents, data: OptionOnSelectData) => {
        if (data.optionValue) {
            onResponseChange(serviceDate.id, data.optionValue as AvailabilityStatus);
        }
    };

    return (
        <Card className={mergeClasses(styles.card, cardBGColorClass)}>
            <CardHeader
                header={<Subtitle2>{formattedDate + ' - ' + formattedTime}</Subtitle2>}
                description={<Body1>{serviceDate.eventName}</Body1>}
                action={<Dropdown placeholder="Meine Antwort" value={responseValue} selectedOptions={selectedOption} onOptionSelect={handleOptionSelect} disabled={readOnly}>
                    {(Object.keys(availabilityLabels) as AvailabilityStatus[]).map(key => (
                        <Option key={key} value={key} text={availabilityLabels[key]}>
                            {availabilityLabels[key]}
                        </Option>
                    ))}
                </Dropdown>}
            />
        </Card>
    );
};
