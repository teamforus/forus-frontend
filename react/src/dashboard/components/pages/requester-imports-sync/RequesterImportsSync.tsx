import React, { useCallback, useEffect, useState } from 'react';
import { countBy } from 'lodash';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useTranslate from '../../../hooks/useTranslate';
import useCanManageRequesterImports from '../../../hooks/permissions/useCanManageRequesterImports';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import usePushApiError from '../../../hooks/usePushApiError';
import useLatestRequest from '../../../hooks/useLatestRequest';
import { useRecordTypeService } from '../../../services/RecordTypeService';
import { useFileService } from '../../../services/FileService';
import { RequesterImportRecordType } from '../../../props/models/RequesterImportRow';
import { Button } from '../../elements/button/Button';
import Card from '../../elements/card/Card';
import InfoBox from '../../elements/info-box/InfoBox';
import BatchProgress from '../../../modules/batch-progress/BatchProgress';
import BatchRunNotice from '../../elements/batch-processing/BatchRunNotice';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import FormPane from '../../elements/forms/elements/FormPane';
import FormGroup from '../../elements/forms/elements/FormGroup';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import useRequesterImportSync from './hooks/useRequesterImportSync';
import RequesterImportSyncPreviewCard from './elements/RequesterImportSyncPreviewCard';
import RequesterImportSyncResultsCard from './elements/RequesterImportSyncResultsCard';

export default function RequesterImportsSync() {
    const organization = useActiveOrganization();
    const canManageRequesterImports = useCanManageRequesterImports();

    if (!canManageRequesterImports) {
        return <OrganizationsNoPermissions />;
    }

    return <RequesterImportsSyncContent key={organization.id} organizationId={organization.id} />;
}

function RequesterImportsSyncContent({ organizationId }: { organizationId: number }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();
    const runCatalogRequest = useLatestRequest();

    const fileService = useFileService();
    const recordTypeService = useRecordTypeService();

    const [catalogLoading, setCatalogLoading] = useState(true);
    const [recordTypes, setRecordTypes] = useState<RequesterImportRecordType[]>(null);

    const sync = useRequesterImportSync(organizationId);

    const downloadPreview = useCallback(() => {
        fileService.downloadFile(
            `requester-sync-preview-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: 'requester_import_sync_preview',
                    update_all: sync.selection,
                    skip_unchanged: sync.skipUnchanged,
                    counts: countBy(sync.preview, 'action'),
                    report: sync.report,
                    preview: sync.preview,
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [fileService, organizationId, sync.selection, sync.skipUnchanged, sync.preview, sync.report]);

    const downloadResults = useCallback(() => {
        fileService.downloadFile(
            `requester-sync-results-${organizationId}.json`,
            JSON.stringify(
                {
                    organization_id: organizationId,
                    operation: 'requester_import_sync',
                    update_all: sync.selection,
                    skip_unchanged: sync.executionSkipUnchanged,
                    skipped_count: sync.report?.skipped_ids?.length || 0,
                    completed_at: sync.report?.status === 'completed' ? sync.report.finished_at : null,
                    preview_report: sync.previewReport,
                    report: sync.report,
                    preview: sync.preview,
                    error: sync.error
                        ? sync.error.data?.message || translate('components.batch_processing.request_failed')
                        : null,
                    results: sync.results,
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [
        fileService,
        organizationId,
        sync.selection,
        sync.executionSkipUnchanged,
        sync.report,
        sync.previewReport,
        sync.preview,
        sync.results,
        sync.error,
        translate,
    ]);

    useEffect(() => {
        runCatalogRequest(
            () =>
                recordTypeService.list<RequesterImportRecordType>({
                    requester_imports: 1,
                    profile_records: 1,
                    organization_id: organizationId,
                }),
            {
                onStart: () => setCatalogLoading(true),
                onSuccess: (response) => setRecordTypes(response.data),
                onError: pushApiError,
                onFinally: () => setCatalogLoading(false),
            },
        );
    }, [organizationId, pushApiError, recordTypeService, runCatalogRequest]);

    const notice = (
        <BatchRunNotice
            report={sync.report}
            error={
                sync.error ? sync.error.data?.message || translate('components.batch_processing.request_failed') : null
            }
            describeBatch={(batch) => translate('components.batch_processing.row_ids', { ids: batch.ids.join(', ') })}
        />
    );

    const backLink = (
        <StateNavLink
            name={DashboardRoutes.REQUESTER_IMPORTS}
            params={{ organizationId }}
            activeExact
            className="button button-default">
            {translate('requester_imports.buttons.back_to_overview')}
        </StateNavLink>
    );

    return (
        <div data-dusk="requesterImportsSyncPage">
            <div className="block block-breadcrumbs">
                <StateNavLink
                    name={DashboardRoutes.REQUESTER_IMPORTS}
                    params={{ organizationId }}
                    activeExact
                    className="breadcrumb-item">
                    {translate('requester_imports.title')}
                </StateNavLink>

                <div className="breadcrumb-item active">{translate('requester_imports.sync.title')}</div>
            </div>

            {catalogLoading ? (
                <LoadingCard />
            ) : sync.phase === 'options' ? (
                <Card
                    title={translate('requester_imports.sync.title')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            {backLink}

                            <Button
                                type="primary"
                                icon="account-search-outline"
                                disabled={recordTypes === null}
                                text={translate('requester_imports.sync_page.preview.calculate')}
                                onClick={sync.calculate}
                            />
                        </div>
                    }>
                    <div className="card-section flex flex-gap flex-vertical">
                        <div>
                            <div className="card-text">{translate('requester_imports.sync.scope')}</div>

                            <InfoBox>
                                <p>{translate('requester_imports.sync.default_description')}</p>
                            </InfoBox>
                        </div>

                        <div className="form">
                            <FormPane
                                title={translate('requester_imports.sync_page.options')}
                                description={translate('requester_imports.sync.update_all_description')}>
                                <FormGroup
                                    input={() => (
                                        <CheckboxControl
                                            checked={sync.updateAll}
                                            title={translate('requester_imports.sync.update_all')}
                                            onChange={(_, checked) => sync.changeMode(checked)}
                                        />
                                    )}
                                />
                            </FormPane>
                        </div>
                    </div>
                </Card>
            ) : sync.phase === 'estimating' || sync.phase === 'running' ? (
                <Card
                    title={
                        sync.phase === 'estimating'
                            ? translate('requester_imports.sync_page.preview.calculating')
                            : translate('requester_imports.sync_page.running')
                    }
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
                        status={
                            sync.report
                                ? undefined
                                : translate('requester_imports.sync_page.preview.calculating_description')
                        }
                    />
                </Card>
            ) : sync.phase === 'preview' ? (
                <RequesterImportSyncPreviewCard
                    updateAll={sync.updateAll}
                    preview={sync.preview}
                    notice={notice}
                    recordTypes={recordTypes}
                    options={
                        sync.unchangedCount > 0 && (
                            <div className="form">
                                <CheckboxControl
                                    narrow={true}
                                    checked={sync.skipUnchanged}
                                    title={translate('requester_imports.sync.skip_unchanged', {
                                        unchanged: sync.unchangedCount,
                                        remaining: sync.report.candidate_ids.length - sync.unchangedCount,
                                    })}
                                    onChange={(_, checked) => sync.setSkipUnchanged(checked)}
                                />
                            </div>
                        )
                    }
                    footer={
                        <div className="button-group flex-center">
                            <Button text={translate('requester_imports.upload.back')} onClick={sync.back} />

                            <Button
                                text={translate('components.batch_processing.download_preview')}
                                onClick={downloadPreview}
                            />

                            <Button
                                type="primary"
                                icon="sync"
                                disabled={sync.report.candidate_ids.length === 0}
                                text={translate('requester_imports.buttons.sync')}
                                onClick={sync.synchronize}
                            />
                        </div>
                    }
                />
            ) : sync.phase === 'results' || (sync.phase === 'interrupted' && sync.report?.stage === 'execution') ? (
                <RequesterImportSyncResultsCard
                    results={sync.results}
                    skipUnchanged={sync.executionSkipUnchanged}
                    notice={notice}
                    title={
                        sync.phase === 'interrupted' ? translate('components.batch_processing.interrupted') : undefined
                    }
                    organizationId={organizationId}
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                icon="download"
                                text={translate('requester_imports.upload.results.download')}
                                onClick={downloadResults}
                            />

                            <StateNavLink
                                name={DashboardRoutes.REQUESTER_IMPORTS}
                                params={{ organizationId }}
                                activeExact
                                className="button button-primary">
                                {translate('requester_imports.buttons.back_to_overview')}
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
                            <Button
                                icon="download"
                                text={translate('requester_imports.upload.results.download')}
                                onClick={downloadResults}
                            />

                            {backLink}
                        </div>
                    }>
                    {notice}
                </Card>
            )}
        </div>
    );
}
