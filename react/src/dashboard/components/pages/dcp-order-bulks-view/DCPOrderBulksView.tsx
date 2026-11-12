import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useCanManageDCP from '../../../hooks/permissions/useCanManageDCP';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import { useDCPService } from '../../../services/DCPService';
import DCPOrderBulk from '../../../props/models/DCPOrderBulk';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import Card from '../../elements/card/Card';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import DCPHistoryCard from '../dcp-orders/elements/DCPHistoryCard';
import DCPOrdersCard from '../dcp-orders/elements/DCPOrdersCard';

export default function DCPOrderBulksView() {
    const organization = useActiveOrganization();
    const allowed = useCanManageDCP();
    const id = Number(useParams().id);

    return allowed ? (
        <DCPOrderBulksViewContent key={`${organization.id}-${id}`} organizationId={organization.id} id={id} />
    ) : (
        <OrganizationsNoPermissions />
    );
}

function DCPOrderBulksViewContent({ organizationId, id }: { organizationId: number; id: number }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runLatestRequest = useLatestRequestWithProgress();

    const service = useDCPService();

    const [loading, setLoading] = useState(true);
    const [bulk, setBulk] = useState<DCPOrderBulk>(null);

    useEffect(() => {
        runLatestRequest((config) => service.bulk(organizationId, id, config), {
            onStart: () => setLoading(true),
            onSuccess: (response) => setBulk(response.data.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [id, organizationId, pushApiError, runLatestRequest, service]);

    if (!bulk) {
        return loading ? <LoadingCard /> : null;
    }

    return (
        <>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.DCP_ORDERS}
                    params={{ organizationId }}
                    query={{ view: 'bulks' }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('dcp.bulks')}
                </StateNavLink>

                <div className="breadcrumb-item active">{translate('dcp.bulk_title', { id: bulk.id })}</div>
            </div>

            <Card title={translate('dcp.bulk_title', { id: bulk.id })}>
                <div className="card-block card-block-keyvalue">
                    <KeyValueItem label={translate('dcp.fields.approved_at')}>{bulk.approved_at_locale}</KeyValueItem>
                    <KeyValueItem label={translate('dcp.fields.employee')}>{bulk.employee_email}</KeyValueItem>
                    <KeyValueItem label={translate('dcp.fields.total')}>{String(bulk.dcp_orders_count)}</KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.submitted')}>
                        {String(bulk.submitted_count)}
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.shipped')}>{String(bulk.shipped_count)}</KeyValueItem>

                    {Object.entries(bulk.counts).map(([state, count]) => (
                        <KeyValueItem key={state} label={translate(`dcp.states.${state}`)}>
                            {String(count)}
                        </KeyValueItem>
                    ))}
                </div>
            </Card>

            <DCPOrdersCard organizationId={organizationId} bulkId={bulk.id} />

            <DCPHistoryCard organizationId={organizationId} type="bulk" id={id} />
        </>
    );
}
