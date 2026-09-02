import { ResponseAnswerStateDto } from "@ct-service-survey/shared";
import { Subtitle2 } from "@fluentui/react-components";
import React from "react";

import { StatusElementByInvitation } from "./StatusElementByInvitation";

export interface InvityAndResponseStatusProps {
    invitedPeopleIds: string[];
    allResponsesAnswerState: ResponseAnswerStateDto[];
}

export const InvityAndResponseStatus = (props: InvityAndResponseStatusProps) => {
    const { invitedPeopleIds, allResponsesAnswerState } = props;
    const answersWithoutInvitation = React.useMemo(() => allResponsesAnswerState.filter(response => !invitedPeopleIds.includes(response.userId)), [allResponsesAnswerState, invitedPeopleIds]);

    return (
        <div>
            <Subtitle2>Einladungen und Antwortstatus</Subtitle2>
            {invitedPeopleIds.map(userId => (
                <StatusElementByInvitation key={userId} userId={userId} answerStatus={allResponsesAnswerState.find(response => response.userId === userId)} />
            ))}
            <p>Einladungen: {invitedPeopleIds.length}</p>
            <p>Antworten: {allResponsesAnswerState.length}</p>
            {answersWithoutInvitation.length > 0 && (
                <p>Antworten ohne Einladung: {answersWithoutInvitation.length}</p>
            )}
        </div>
    )
}