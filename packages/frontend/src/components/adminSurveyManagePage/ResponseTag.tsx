import { Tag } from "@fluentui/react-components";

import { usePersonById } from "../../hooks/usePersonSearch";

export interface ResponseTagProps {
    personId: string;
    availability: 'yes' | 'no' | 'maybe';
}

export const ResponseTag = (props: ResponseTagProps) => {
    const { data } = usePersonById(props.personId);

    return <Tag>
        {data?.name ?? props.personId}
    </Tag>;
};