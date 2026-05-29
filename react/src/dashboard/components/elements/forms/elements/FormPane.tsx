import React, { ReactNode } from 'react';
import classNames from 'classnames';

export default function FormPane({
    dusk = null,
    title,
    description,
    large = false,
    children,
}: {
    dusk?: string;
    title: string;
    description?: ReactNode;
    large?: boolean;
    children: ReactNode | ReactNode[];
}) {
    return (
        <div className={classNames('form-pane', large && 'form-pane-lg')} data-dusk={dusk}>
            <div className="form-pane-title">{title}</div>
            <div className="form-pane-content">
                {description && <div className="form-pane-description">{description}</div>}
                {children}
            </div>
        </div>
    );
}
