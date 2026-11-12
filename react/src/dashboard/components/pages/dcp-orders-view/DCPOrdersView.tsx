import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useCanManageDCP from '../../../hooks/permissions/useCanManageDCP';
import useCanManageVoucherPasses from '../../../hooks/permissions/useCanManageVoucherPasses';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import useLatestRequestWithProgress from '../../../hooks/useLatestRequestWithProgress';
import { useDCPService } from '../../../services/DCPService';
import DCPOrder from '../../../props/models/DCPOrder';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import Card from '../../elements/card/Card';
import KeyValueItem from '../../elements/key-value/KeyValueItem';
import BlockInlineCopy from '../../elements/block-inline-copy/BlockInlineCopy';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import DCPOrderStateLabel from '../dcp-orders/elements/DCPOrderStateLabel';
import DCPHistoryCard from '../dcp-orders/elements/DCPHistoryCard';

export default function DCPOrdersView() {
    const organization = useActiveOrganization();
    const allowed = useCanManageDCP();
    const id = Number(useParams().id);

    return allowed ? (
        <DCPOrdersViewContent key={`${organization.id}-${id}`} organizationId={organization.id} id={id} />
    ) : (
        <OrganizationsNoPermissions />
    );
}

function DCPOrdersViewContent({ organizationId, id }: { organizationId: number; id: number }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const canManagePasses = useCanManageVoucherPasses();
    const runLatestRequest = useLatestRequestWithProgress();

    const service = useDCPService();

    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<DCPOrder>(null);

    useEffect(() => {
        runLatestRequest((config) => service.order(organizationId, id, config), {
            onStart: () => setLoading(true),
            onSuccess: (response) => setOrder(response.data.data),
            onError: pushApiError,
            onFinally: () => setLoading(false),
        });
    }, [id, organizationId, pushApiError, runLatestRequest, service]);

    if (!order) {
        return loading ? <LoadingCard /> : null;
    }

    return (
        <>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.DCP_ORDERS}
                    params={{ organizationId }}
                    activeExact={true}
                    className="breadcrumb-item">
                    {translate('dcp.title')}
                </StateNavLink>

                <div className="breadcrumb-item active">{translate('dcp.order_title', { id: order.id })}</div>
            </div>

            <Card title={translate('dcp.order_title', { id: order.id })}>
                <div className="card-block card-block-keyvalue">
                    <KeyValueItem label={translate('dcp.fields.state')}>
                        <DCPOrderStateLabel order={order} />
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.pass')}>
                        {order.source ? (
                            canManagePasses ? (
                                <StateNavLink
                                    name={DashboardRoutes.VOUCHER_PASSES}
                                    params={{ organizationId }}
                                    query={{ q: order.source.code }}>
                                    {`#${order.source.id} · ${order.source.code}`}
                                </StateNavLink>
                            ) : (
                                `#${order.source.id} · ${order.source.code}`
                            )
                        ) : null}
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.bulk')}>
                        {order.dcp_order_bulk_id ? (
                            <StateNavLink
                                name={DashboardRoutes.DCP_ORDER_BULK}
                                params={{ organizationId, id: order.dcp_order_bulk_id }}>
                                {`#${order.dcp_order_bulk_id}`}
                            </StateNavLink>
                        ) : null}
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.order_id')}>
                        <BlockInlineCopy value={order.order_id}>{order.order_id}</BlockInlineCopy>
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.order_id_dcp')}>
                        {order.order_id_dcp ? (
                            <BlockInlineCopy value={order.order_id_dcp}>{order.order_id_dcp}</BlockInlineCopy>
                        ) : null}
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.status')}>
                        {order.status_id !== null ? `${order.status_locale} (${order.status_id})` : null}
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.status_message')}>{order.status_message}</KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.diagnostic_id')}>
                        {order.diagnostic_id ? (
                            <BlockInlineCopy value={order.diagnostic_id}>{order.diagnostic_id}</BlockInlineCopy>
                        ) : null}
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.connection')}>
                        <>
                            {order.connection.implementation.name}
                            {' · '}
                            {translate(`dcp.environments.${order.connection.environment}`)}
                            {` · #${order.connection.id}`}
                        </>
                    </KeyValueItem>

                    <KeyValueItem label={translate('dcp.fields.label')}>{order.label}</KeyValueItem>
                    <KeyValueItem label={translate('dcp.fields.employee')}>{order.employee_email}</KeyValueItem>

                    {(
                        [
                            'created_at',
                            'updated_at',
                            'approved_at',
                            'sending_at',
                            'submitted_at',
                            'last_status_checked_at',
                            'shipped_at',
                        ] as const
                    ).map((key) => (
                        <KeyValueItem key={key} label={translate(`dcp.fields.${key}`)}>
                            {order[`${key}_locale`]}
                        </KeyValueItem>
                    ))}
                </div>
            </Card>

            <Card title={translate('dcp.delivery')}>
                <div className="card-block card-block-keyvalue">
                    {(['first_name', 'last_name', 'address1', 'postal_code', 'city', 'country'] as const).map((key) => (
                        <KeyValueItem key={key} label={translate(`dcp.fields.${key}`)}>
                            {order.delivery_address[key]}
                        </KeyValueItem>
                    ))}
                </div>
            </Card>

            {order.order_rows.map((row) =>
                row.tagIds.map((card) => (
                    <Card key={`${row.key}-${card.key}`} title={translate('dcp.printed_details')}>
                        <div className="card-block card-block-keyvalue">
                            {(
                                [
                                    'printedCardType',
                                    'printedFirstName',
                                    'printedLastName',
                                    'printedDateOfBirth',
                                    'printedCityCode',
                                    'printedCardNumber',
                                ] as const
                            ).map((key) => (
                                <KeyValueItem key={key} label={translate(`dcp.printed.${key}`)}>
                                    {card[key]}
                                </KeyValueItem>
                            ))}

                            <KeyValueItem label={translate('dcp.printed.printedQrCode')}>
                                <BlockInlineCopy value={card.printedQrCode}>{card.printedQrCode}</BlockInlineCopy>
                            </KeyValueItem>
                        </div>
                    </Card>
                )),
            )}

            <DCPHistoryCard organizationId={organizationId} type="order" id={id} />
        </>
    );
}
