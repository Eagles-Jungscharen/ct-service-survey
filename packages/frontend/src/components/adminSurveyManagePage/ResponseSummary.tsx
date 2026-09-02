import type { ResponseDto } from '@ct-service-survey/shared';
import React from 'react';

import { ResponseTag } from './ResponseTag';

export interface ResponseSummaryProps {
    currentResponses: ResponseDto[];
}
export const ResponseSummary = (props: ResponseSummaryProps) => {
    const yesResponse = React.useMemo(() => props.currentResponses.filter(response => response.availability === 'yes'), [props.currentResponses]);
    const noResponse = React.useMemo(() => props.currentResponses.filter(response => response.availability === 'no'), [props.currentResponses]);
    const maybeResponse = React.useMemo(() => props.currentResponses.filter(response => response.availability === 'maybe'), [props.currentResponses]);
    return (
        <div>
            <div>Möglich: {yesResponse.map(response => <ResponseTag key={response.userId} personId={response.userId} availability="yes" />)}</div>
            <div>Vieleicht: {maybeResponse.map(response => <ResponseTag key={response.userId} personId={response.userId} availability="maybe" />)}</div>
            <div>Nein: {noResponse.map(response => <ResponseTag key={response.userId} personId={response.userId} availability="no" />)}</div>

        </div>
    );
};