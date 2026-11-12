import React, { useCallback } from 'react';
import { countBy } from 'lodash';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useCanManageVoucherPasses from '../../../hooks/permissions/useCanManageVoucherPasses';
import useTranslate from '../../../hooks/useTranslate';
import { useFileService } from '../../../services/FileService';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import Card from '../../elements/card/Card';
import { Button } from '../../elements/button/Button';
import InfoBox from '../../elements/info-box/InfoBox';
import BatchProgress from '../../../modules/batch-progress/BatchProgress';
import BatchRunNotice from '../../elements/batch-processing/BatchRunNotice';
import useVoucherPassDCP from './hooks/useVoucherPassDCP';
import VoucherPassDCPResultsCard from './elements/VoucherPassDCPResultsCard';

export default function VoucherPassesDCP() {
    const organization = useActiveOrganization();
    const allowed = useCanManageVoucherPasses();

    return allowed ? (
        <VoucherPassesDCPContent key={organization.id} organizationId={organization.id} />
    ) : (
        <OrganizationsNoPermissions />
    );
}

function VoucherPassesDCPContent({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();

    const fileService = useFileService();

    const sync = useVoucherPassDCP(organizationId);

    const download = useCallback(() => {
        const preview = sync.report?.stage !== 'execution';
        const rows = preview ? sync.preview : sync.results;

        fileService.downloadFile(
            `voucher-pass-dcp-${preview ? 'preview' : 'results'}-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: preview ? 'voucher_pass_dcp_preview' : 'voucher_pass_dcp_sync',
                    preview_report: sync.previewReport,
                    report: sync.report,
                    counts: countBy(rows, 'status'),
                    preview: sync.preview,
                    results: sync.results,
                    error: sync.error?.data?.message || null,
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [fileService, organizationId, sync.error, sync.preview, sync.previewReport, sync.report, sync.results]);

    const backLink = (
        <StateNavLink
            name={DashboardRoutes.VOUCHER_PASSES}
            params={{ organizationId }}
            className="button button-default">
            {translate('dcp_prepare.back_to_passes')}
        </StateNavLink>
    );

    const notice = (
        <BatchRunNotice
            report={sync.report}
            error={
                sync.error ? sync.error.data?.message || translate('components.batch_processing.request_failed') : null
            }
            describeBatch={(batch) => translate('dcp_prepare.pass_ids', { ids: batch.ids.join(', ') })}
        />
    );

    return (
        <>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.VOUCHER_PASSES}
                    params={{ organizationId }}
                    activeExact
                    className="breadcrumb-item">
                    {translate('voucher_passes.title')}
                </StateNavLink>

                <div className="breadcrumb-item active">{translate('dcp_prepare.title')}</div>
            </div>

            {sync.phase === 'options' ? (
                <Card
                    title={translate('dcp_prepare.title')}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            {backLink}

                            <Button
                                type="primary"
                                icon="account-search-outline"
                                text={translate('dcp_prepare.calculate')}
                                onClick={() => sync.calculate(null)}
                            />
                        </div>
                    }>
                    <div className="card-text">{translate('dcp_prepare.description')}</div>

                    <InfoBox>
                        <p>{translate('dcp_prepare.scope')}</p>
                    </InfoBox>
                </Card>
            ) : sync.phase === 'estimating' || sync.phase === 'running' ? (
                <Card
                    title={translate(sync.phase === 'estimating' ? 'dcp_prepare.calculating' : 'dcp_prepare.running')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            {sync.phase === 'estimating' ? (
                                <Button
                                    text={translate('components.batch_processing.cancel_preview')}
                                    onClick={sync.cancelPreview}
                                />
                            ) : (
                                <Button
                                    text={translate(
                                        sync.stopping
                                            ? 'components.batch_processing.stopping'
                                            : 'components.batch_processing.stop',
                                    )}
                                    disabled={sync.stopping}
                                    onClick={sync.stop}
                                />
                            )}
                        </div>
                    }>
                    <BatchProgress
                        processed={sync.report?.processed}
                        total={sync.report?.total}
                        timing={sync.timing}
                        status={sync.report ? undefined : translate('dcp_prepare.loading_ids')}
                    />
                </Card>
            ) : sync.phase === 'preview' ? (
                <VoucherPassDCPResultsCard
                    key="preview"
                    organizationId={organizationId}
                    rows={sync.preview}
                    preview={true}
                    notice={notice}
                    footer={
                        <div className="button-group flex-center">
                            <Button text={translate('requester_imports.upload.back')} onClick={sync.reset} />

                            <Button
                                text={translate('components.batch_processing.download_preview')}
                                onClick={download}
                            />

                            <Button
                                type="primary"
                                icon="sync"
                                text={translate('dcp_prepare.confirm')}
                                disabled={sync.report.candidate_ids.length === 0}
                                onClick={() => sync.execute()}
                            />
                        </div>
                    }
                />
            ) : sync.phase === 'results' || (sync.phase === 'interrupted' && sync.report?.stage === 'execution') ? (
                <VoucherPassDCPResultsCard
                    key="results"
                    organizationId={organizationId}
                    rows={sync.results || []}
                    preview={false}
                    notice={notice}
                    footer={
                        <div className="button-group flex-center">
                            {backLink}

                            <Button icon="download" text={translate('dcp_prepare.download')} onClick={download} />

                            <StateNavLink
                                name={DashboardRoutes.DCP_ORDERS}
                                params={{ organizationId }}
                                className="button button-primary">
                                {translate('dcp_prepare.view_orders')}
                            </StateNavLink>
                        </div>
                    }
                />
            ) : (
                <Card
                    title={translate('components.batch_processing.interrupted')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            {backLink}

                            <Button icon="download" text={translate('dcp_prepare.download')} onClick={download} />
                        </div>
                    }>
                    {notice}
                </Card>
            )}
        </>
    );
}
