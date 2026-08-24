import React from 'react';

export const useFormattedDate = (dateString: string | undefined): string => {
    const formattedDate = React.useMemo(() => {
        if (!dateString) {
            return '';
        }
        return new Date(dateString).toLocaleDateString('de-CH', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }, [dateString]);
    return formattedDate;
};