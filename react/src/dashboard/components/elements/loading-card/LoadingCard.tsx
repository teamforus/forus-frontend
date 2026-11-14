import React, { Fragment, useMemo } from 'react';

export default function LoadingCard({
    type = 'card',
    description = null,
}: {
    type?: 'card' | 'card-section';
    description?: string;
}) {
    const cardSection = useMemo(() => {
        return (
            <div className="card-section">
                <div className="card-loading">
                    <em className="mdi mdi-loading mdi-spin" />
                </div>
                {description && <div className="card-text text-center">{description}</div>}
            </div>
        );
    }, [description]);

    return type == 'card' ? <div className="card">{cardSection}</div> : <Fragment>{cardSection}</Fragment>;
}
