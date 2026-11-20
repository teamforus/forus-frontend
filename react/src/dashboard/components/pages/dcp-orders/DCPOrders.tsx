import React from 'react';
import { StringParam, useQueryParam } from 'use-query-params';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useCanManageDCP from '../../../hooks/permissions/useCanManageDCP';
import useTranslate from '../../../hooks/useTranslate';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import BlockLabelTabs from '../../elements/block-label-tabs/BlockLabelTabs';
import DCPOrdersCard from './elements/DCPOrdersCard';
import DCPBulksCard from './elements/DCPBulksCard';
import { useNavigateState } from '../../../modules/state_router/Router';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';

export default function DCPOrders() {
    const organization = useActiveOrganization();
    const allowed = useCanManageDCP();
    const translate = useTranslate();
    const navigateState = useNavigateState();
    const [view] = useQueryParam('view', StringParam);

    const tabs = (
        <BlockLabelTabs
            value={view === 'bulks' ? 'bulks' : 'orders'}
            setValue={(view) =>
                navigateState(DashboardRoutes.DCP_ORDERS, { organizationId: organization.id }, { view })
            }
            tabs={[
                { value: 'orders', label: translate('dcp.orders') },
                { value: 'bulks', label: translate('dcp.bulks') },
            ]}
        />
    );

    if (!allowed) {
        return <OrganizationsNoPermissions />;
    }

    return view === 'bulks' ? (
        <DCPBulksCard key={organization.id} organizationId={organization.id} tabs={tabs} />
    ) : (
        <DCPOrdersCard key={organization.id} organizationId={organization.id} tabs={tabs} />
    );
}
