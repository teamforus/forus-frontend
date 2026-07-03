import React, { Fragment, useMemo } from 'react';

export default function LoadingCard({ type = 'card' }: { type?: 'card' | 'card-section' }) {
    const cardSection = useMemo(
        () => (
            <div className="card-section">
                <div className="card-loading">
                    <em className="mdi mdi-loading mdi-spin" />
                </div>
            </div>
        ),
        [],
    );

    return type == 'card' ? <div className="card">{cardSection}</div> : <Fragment>{cardSection}</Fragment>;
}
