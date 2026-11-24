import React, { Fragment } from 'react';
import classNames from 'classnames';

export default function HeaderSearchItemContent({
    icon,
    title,
    subtitle,
    thumbnailUrl,
    q,
}: {
    icon: string;
    title: string;
    subtitle?: string;
    thumbnailUrl?: string;
    q: string;
}) {
    const index = q && title ? title.toLowerCase().indexOf(q.toLowerCase()) : -1;

    return (
        <Fragment>
            {thumbnailUrl ? (
                <img className="header-search-item-media" src={thumbnailUrl} alt="" />
            ) : (
                <em className={classNames('mdi', icon, 'header-search-item-icon')} aria-hidden="true" />
            )}
            <span className="header-search-item-details">
                <span className="header-search-item-title">
                    {index === -1 ? (
                        title
                    ) : (
                        <Fragment>
                            {title.slice(0, index)}
                            <span className="header-search-item-highlight">{title.slice(index, index + q.length)}</span>
                            {title.slice(index + q.length)}
                        </Fragment>
                    )}
                </span>
                {subtitle && <span className="header-search-item-subtitle">{subtitle}</span>}
            </span>
        </Fragment>
    );
}
