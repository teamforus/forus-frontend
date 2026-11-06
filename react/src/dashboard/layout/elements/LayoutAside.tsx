import React, { Fragment } from 'react';
import classNames from 'classnames';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import useEnvData from '../../hooks/useEnvData';
import LayoutAsideValidator from './aside/LayoutAsideValidator';
import LayoutAsideSponsor from './aside/LayoutAsideSponsor';
import LayoutAsideProvider from './aside/LayoutAsideProvider';

export const LayoutAside = ({
    open = false,
    animating = false,
    onClose,
    onAnimationEnd,
}: {
    open?: boolean;
    animating?: boolean;
    onClose?: () => void;
    onAnimationEnd?: () => void;
}) => {
    const envData = useEnvData();
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            {open && <div className="app-sidebar-backdrop" onClick={onClose} />}

            <aside
                className={classNames('app', 'app-sidebar', open && 'app-sidebar-open', animating && 'animating')}
                onTransitionEnd={(event) => {
                    if (event.target === event.currentTarget && event.propertyName === 'transform') {
                        onAnimationEnd?.();
                    }
                }}>
                {activeOrganization && envData.client_type == 'sponsor' && (
                    <LayoutAsideSponsor organization={activeOrganization} />
                )}

                {activeOrganization && envData.client_type == 'provider' && (
                    <LayoutAsideProvider organization={activeOrganization} />
                )}

                {activeOrganization && envData.client_type == 'validator' && (
                    <LayoutAsideValidator organization={activeOrganization} />
                )}
            </aside>
        </Fragment>
    );
};
