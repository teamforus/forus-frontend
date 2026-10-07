import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function StatusBanner({
    type = 'default',
    borderType = 'solid',
    className = '',
    children,
    dusk = null,
}: {
    type?: 'default' | 'primary' | 'warning' | 'danger' | 'pending' | 'success' | 'expired';
    borderType?: 'dashed' | 'none' | 'solid';
    className?: string;
    children: ReactNode | ReactNode[];
    dusk?: string;
}) {
    return (
        <div
            data-dusk={dusk}
            className={classNames(
                'block block-status-banner',
                type === 'default' && 'block-status-banner-default',
                type === 'primary' && 'block-status-banner-primary',
                type === 'expired' && 'block-status-banner-default',
                type === 'pending' && 'block-status-banner-pending',
                type === 'warning' && 'block-status-banner-warning',
                type === 'danger' && 'block-status-banner-danger',
                type === 'success' && 'block-status-banner-success',
                borderType === 'none' && 'block-status-banner-borderless',
                borderType === 'dashed' && 'block-status-banner-dashed',
                className,
            )}>
            <em
                className={classNames(
                    'status-banner-icon',
                    'mdi',
                    'flex-vertical',
                    'flex-start',
                    type === 'expired' && 'mdi-clock-alert-outline',
                    type === 'warning' && 'mdi-exclamation-thick',
                    type === 'success' && 'mdi-check-bold',
                    type === 'danger' && 'mdi-minus-thick',
                    type === 'pending' && 'mdi-timer-sand',
                    type === 'default' && 'mdi-folder-off-outline',
                )}
            />

            <div className="status-banner-content">{children}</div>
        </div>
    );
}
