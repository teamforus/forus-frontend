import React from 'react';
import classNames from 'classnames';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import BlockEmpty from '../block-empty/BlockEmpty';
import { BlockEmptyProps } from '../block-empty/types';

export interface EmptyButtonType {
    type?: 'default' | 'primary' | 'danger';
    state?: DashboardRoutes;
    stateParams?: object;
    icon?: string;
    text?: string;
    dusk?: string;
    iconPosition?: 'start' | 'end';
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export default function EmptyCard({
    button = null,
    type = 'card',
    actions,
    ...props
}: Omit<BlockEmptyProps, 'variant' | 'dataDusk'> & {
    button?: EmptyButtonType;
    type?: 'card' | 'card-section' | 'card-section-content';
}) {
    const content = (
        <BlockEmpty
            {...props}
            dataDusk="emptyCard"
            actions={
                (button || actions) && (
                    <>
                        {button && (
                            <StateNavLink
                                name={button.state}
                                params={button.stateParams}
                                onClick={button.onClick}
                                className={classNames(
                                    'button',
                                    (!button.type || button.type === 'default') && 'button-default',
                                    button.type === 'primary' && 'button-primary',
                                    button.type === 'danger' && 'button-danger',
                                )}
                                dataDusk={button.dusk || 'btnEmptyBlock'}>
                                {button.icon && (!button.iconPosition || button.iconPosition == 'start') && (
                                    <em className={`mdi mdi-${button.icon} icon-start`} />
                                )}
                                {button.text}
                                {button.icon && button.iconPosition == 'end' && (
                                    <em className={`mdi mdi-${button.icon} icon-end`} />
                                )}
                            </StateNavLink>
                        )}

                        {actions}
                    </>
                )
            }
        />
    );

    if (type === 'card-section-content') {
        return content;
    }

    const section = <div className="card-section">{content}</div>;

    return type === 'card' ? <div className="card">{section}</div> : section;
}
