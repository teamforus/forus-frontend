import React, { Fragment } from 'react';
import classNames from 'classnames';
import useActiveOrganization from '../../hooks/useActiveOrganization';
import useEnvData from '../../hooks/useEnvData';
import LayoutAsideValidator from './aside/LayoutAsideValidator';
import LayoutAsideSponsor from './aside/LayoutAsideSponsor';
import LayoutAsideProvider from './aside/LayoutAsideProvider';

export const LayoutAside = ({ open = false, onClose }: { open?: boolean; onClose?: () => void }) => {
    const envData = useEnvData();
    const activeOrganization = useActiveOrganization();

    return (
        <Fragment>
            {open && <div className="app-sidebar-backdrop" onClick={onClose} />}

            <aside className={classNames('app', 'app-sidebar', open && 'app-sidebar-open')}>
                <div className="sidebar-drawer-header">
                    <button
                        type="button"
                        className="sidebar-drawer-close"
                        aria-label="Menu sluiten"
                        data-dusk="sidebarDrawerClose"
                        onClick={onClose}>
                        <em className="mdi mdi-close" />
                    </button>
                </div>

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
