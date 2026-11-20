import React from 'react';
import classNames from 'classnames';

export default function TableCheckboxControl({
    checked,
    onClick,
    dusk,
}: {
    checked: boolean;
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    dusk?: string;
}) {
    return (
        <label
            className={classNames('checkbox', 'checkbox-compact', 'checkbox-th', checked && 'checked')}
            onClick={onClick}
            data-dusk={dusk}
            style={{ cursor: 'pointer' }}>
            <div className="checkbox-box">
                <div className="mdi mdi-check" />
            </div>
        </label>
    );
}
