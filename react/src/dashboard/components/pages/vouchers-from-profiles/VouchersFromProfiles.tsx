import React, { useCallback, useEffect, useState } from 'react';
import classNames from 'classnames';
import { countBy } from 'lodash';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import useTranslate from '../../../hooks/useTranslate';
import usePushApiError from '../../../hooks/usePushApiError';
import useCanCreateVouchersFromProfiles from '../../../hooks/permissions/useCanCreateVouchersFromProfiles';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import OrganizationsNoPermissions from '../organizations-no-permissions/OrganizationsNoPermissions';
import { Button } from '../../elements/button/Button';
import Card from '../../elements/card/Card';
import BatchProgress from '../../../modules/batch-progress/BatchProgress';
import BatchRunNotice from '../../elements/batch-processing/BatchRunNotice';
import useProfileVoucherAward from './hooks/useProfileVoucherAward';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import FormPane from '../../elements/forms/elements/FormPane';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import ProfileVoucherAwardResultsCard from './elements/ProfileVoucherAwardResultsCard';
import Organization from '../../../props/models/Organization';
import Fund from '../../../props/models/Fund';
import { ResponseError } from '../../../props/ApiResponses';
import { useFileService } from '../../../services/FileService';
import { useFundService } from '../../../services/FundService';
import { useHelperService } from '../../../services/HelperService';

export default function VouchersFromProfiles() {
    const organization = useActiveOrganization();
    const canCreateVouchersFromProfiles = useCanCreateVouchersFromProfiles();

    if (!canCreateVouchersFromProfiles) {
        return <OrganizationsNoPermissions />;
    }

    return <VouchersFromProfilesContent key={organization.id} organization={organization} />;
}

function VouchersFromProfilesContent({ organization }: { organization: Organization }) {
    const translate = useTranslate();
    const pushApiError = usePushApiError();

    const fileService = useFileService();
    const fundService = useFundService();
    const helperService = useHelperService();

    const [funds, setFunds] = useState<Fund[]>(null);

    const award = useProfileVoucherAward(organization.id);

    const { phase, preview, selectedFundIds, hasEligibleAwards, setSelectedFundIds } = award;

    const busy = phase === 'estimating' || phase === 'running';
    const allFundsSelected = selectedFundIds.length > 0 && selectedFundIds.length === funds?.length;

    const downloadPreview = useCallback(() => {
        fileService.downloadFile(
            `voucher-preview-${organization.id}.json`,
            JSON.stringify(
                {
                    organization_id: organization.id,
                    operation: 'award_from_profiles_preview',
                    fund_ids: award.selection,
                    skip_would_skip: award.skipWouldSkip,
                    counts: countBy(award.preview, 'status'),
                    report: award.report,
                    preview: award.preview,
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [fileService, organization.id, award.selection, award.skipWouldSkip, award.preview, award.report]);

    const downloadResults = useCallback(() => {
        fileService.downloadFile(
            `voucher-results-${organization.id}.json`,
            JSON.stringify(
                {
                    organization_id: organization.id,
                    fund_ids: award.selection,
                    operation: 'award_from_profiles',
                    skip_would_skip: award.executionSkipWouldSkip,
                    skipped_pairs: award.skippedPairs.map(({ profile_id, fund_id }) => ({ profile_id, fund_id })),
                    completed_at: award.report?.status === 'completed' ? award.report.finished_at : null,
                    preview_report: award.previewReport,
                    report: award.report,
                    preview: award.preview,
                    error: award.error
                        ? award.error.data?.message || translate('components.batch_processing.request_failed')
                        : null,
                    results: award.results,
                },
                null,
                2,
            ),
            'application/json',
        );
    }, [
        award.selection,
        award.executionSkipWouldSkip,
        award.skippedPairs,
        award.report,
        award.previewReport,
        award.preview,
        award.results,
        award.error,
        fileService,
        organization.id,
        translate,
    ]);

    useEffect(() => {
        let active = true;

        helperService
            .recursiveLeach((page: number) =>
                fundService.list(organization.id, {
                    voucher_creation_from_profiles: 1,
                    with_archived: 1,
                    per_page: 100,
                    page,
                }),
            )
            .then((funds) => {
                if (active) {
                    setFunds(funds);
                }
            })
            .catch((error: ResponseError) => {
                if (active) {
                    setFunds([]);
                    pushApiError(error);
                }
            });

        return () => {
            active = false;
        };
    }, [fundService, helperService, organization.id, pushApiError]);

    const notice = (
        <BatchRunNotice
            report={award.report}
            error={
                award.error
                    ? award.error.data?.message || translate('components.batch_processing.request_failed')
                    : null
            }
            describeBatch={(batch) =>
                translate('components.batch_processing.profile_ids', { fund: batch.fund_id, ids: batch.ids.join(', ') })
            }
        />
    );

    return (
        <div data-dusk="vouchersFromProfilesPage">
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name={DashboardRoutes.VOUCHERS}
                    activeExact
                    params={{ organizationId: organization.id }}>
                    {translate('vouchers.header.title')}
                </StateNavLink>
                <div className="breadcrumb-item active">{translate('vouchers.from_profiles.action')}</div>
            </div>

            {phase === 'options' && !funds && <LoadingCard />}

            {phase === 'options' && funds && (
                <div className="card" data-dusk="profileVoucherAwardReadyCard">
                    <div className="card-header">
                        <div className="card-title">{translate('vouchers.from_profiles.preview_states.ready')}</div>
                    </div>
                    <div className="card-section">
                        <div className="form">
                            <FormPane
                                title={translate('vouchers.from_profiles.preview_states.funds')}
                                description={translate('vouchers.from_profiles.preview_states.funds_description')}>
                                <div className="flex flex-vertical">
                                    {funds.map((fund) => (
                                        <CheckboxControl
                                            key={fund.id}
                                            title={fund.name}
                                            checked={selectedFundIds.includes(fund.id)}
                                            onChange={(_, checked) => {
                                                award.reset();
                                                setSelectedFundIds((ids) =>
                                                    checked ? [...ids, fund.id] : ids.filter((id) => id !== fund.id),
                                                );
                                            }}
                                        />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    className={classNames(
                                        'button button-text button-text-primary',
                                        'button-text-padless flex-self-start',
                                    )}
                                    onClick={() => {
                                        award.reset();
                                        setSelectedFundIds(allFundsSelected ? [] : funds.map((fund) => fund.id));
                                    }}>
                                    {allFundsSelected
                                        ? translate('vouchers.from_profiles.preview_states.deselect_all')
                                        : translate('vouchers.from_profiles.preview_states.select_all')}
                                </button>
                            </FormPane>
                        </div>
                    </div>
                    <div className="card-footer card-footer-primary">
                        <div className="button-group flex-center">
                            <StateNavLink
                                className="button button-default"
                                name={DashboardRoutes.VOUCHERS}
                                activeExact
                                params={{ organizationId: organization.id }}>
                                {translate('vouchers.from_profiles.preview_states.cancel')}
                            </StateNavLink>
                            <Button
                                type="primary"
                                icon="account-search-outline"
                                text={translate('vouchers.from_profiles.preview_estimate.action')}
                                disabled={selectedFundIds.length === 0}
                                onClick={award.calculate}
                            />
                        </div>
                    </div>
                </div>
            )}

            {busy && (
                <div className="card" data-dusk="profileVoucherAwardLoadingCard">
                    <div className="card-header">
                        <div className="card-title">
                            {phase === 'estimating'
                                ? translate('vouchers.from_profiles.preview_states.preparing')
                                : translate('vouchers.from_profiles.preview_states.processing')}
                        </div>
                    </div>

                    <BatchProgress
                        processed={award.report?.processed}
                        total={award.report?.total}
                        timing={award.timing}
                        status={
                            award.report
                                ? undefined
                                : translate('vouchers.from_profiles.preview_states.preparing_description')
                        }
                    />

                    <div className="card-footer card-footer-primary">
                        <div className="button-group flex-center">
                            {phase === 'estimating' ? (
                                <Button
                                    text={translate('components.batch_processing.cancel_preview')}
                                    onClick={award.cancelPreview}
                                />
                            ) : (
                                <Button
                                    text={translate(
                                        award.stopping
                                            ? 'components.batch_processing.stopping'
                                            : 'components.batch_processing.stop',
                                    )}
                                    disabled={award.stopping}
                                    onClick={award.stop}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {phase === 'preview' && (
                <ProfileVoucherAwardResultsCard
                    estimated
                    results={preview}
                    notice={notice}
                    fundCount={selectedFundIds.length}
                    options={
                        award.skippedCount > 0 && (
                            <div className="form">
                                <CheckboxControl
                                    narrow={true}
                                    checked={award.skipWouldSkip}
                                    title={translate('vouchers.from_profiles.skip_would_skip', {
                                        skipped: award.skippedCount,
                                        remaining: award.report.total - award.skippedCount,
                                    })}
                                    onChange={(_, checked) => award.setSkipWouldSkip(checked)}
                                />
                            </div>
                        )
                    }
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                text={translate('vouchers.from_profiles.preview_states.back')}
                                onClick={award.reset}
                            />

                            <Button
                                text={translate('components.batch_processing.download_preview')}
                                onClick={downloadPreview}
                            />

                            {hasEligibleAwards && (
                                <Button
                                    type="primary"
                                    icon="check"
                                    text={translate('vouchers.from_profiles.preview_estimate.confirm')}
                                    onClick={award.createVouchers}
                                />
                            )}
                        </div>
                    }
                />
            )}

            {phase === 'interrupted' && award.report?.stage !== 'execution' && (
                <Card
                    title={translate('components.batch_processing.interrupted')}
                    section={false}
                    footerType="primary"
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                icon="download"
                                text={translate('vouchers.from_profiles.preview_states.download')}
                                onClick={downloadResults}
                            />

                            <StateNavLink
                                className="button button-default"
                                name={DashboardRoutes.VOUCHERS}
                                activeExact
                                params={{ organizationId: organization.id }}>
                                {translate('vouchers.from_profiles.preview_states.back')}
                            </StateNavLink>
                        </div>
                    }>
                    {notice}
                </Card>
            )}

            {(phase === 'results' || (phase === 'interrupted' && award.report?.stage === 'execution')) && (
                <ProfileVoucherAwardResultsCard
                    key="results"
                    results={award.results}
                    notice={notice}
                    title={phase === 'interrupted' ? translate('components.batch_processing.interrupted') : undefined}
                    fundCount={award.selection.length}
                    footer={
                        <div className="button-group flex-center">
                            <Button
                                icon="download"
                                text={translate('vouchers.from_profiles.preview_states.download')}
                                onClick={downloadResults}
                            />
                            <StateNavLink
                                className="button button-primary"
                                name={DashboardRoutes.VOUCHERS}
                                activeExact
                                params={{ organizationId: organization.id }}>
                                <em className="mdi mdi-check icon-start" />
                                {translate('vouchers.from_profiles.preview_states.finish')}
                            </StateNavLink>
                        </div>
                    }
                />
            )}
        </div>
    );
}
