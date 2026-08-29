import React from 'react';

export const useFormattedTime = (dateString: string | undefined): string => {
    const formattedDate = React.useMemo(() => {
        if (!dateString) {
            return '';
        }
        return new Date(dateString).toLocaleTimeString('de-CH', { hour: '2-digit', minute: '2-digit' });
    }, [dateString]);
    return formattedDate;
};