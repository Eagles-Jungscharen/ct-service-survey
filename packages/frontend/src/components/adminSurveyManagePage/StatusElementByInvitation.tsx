import { ResponseAnswerStateDto } from "@ct-service-survey/shared";
import { makeStyles, tokens } from "@fluentui/react-components";

import { usePersonById } from "../../hooks/usePersonSearch";

export interface StatusElementByInvitationProps {
    userId: string;
    answerStatus: ResponseAnswerStateDto | undefined;
}

const useStyles = makeStyles({
    line: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
});

export const StatusElementByInvitation = (props: StatusElementByInvitationProps) => {
    const { userId, answerStatus } = props;
    const { data } = usePersonById(userId);
    const styles = useStyles();


    return (
        <div className={styles.line}>
            <span>{data?.name ?? userId}</span>
            <span>{answerStatus?.state ?? 'Nicht beantwortet'}</span>
        </div>
    )
}