import React, { Fragment, ReactNode, useCallback, useMemo, useState } from 'react';
import { countBy, groupBy } from 'lodash';
import useTranslate from '../../../../hooks/useTranslate';
import { ApiPaginationMetaProp } from '../../../../props/ApiResponses';
import useFilterNext from '../../../../modules/filter_next/useFilterNext';
import Paginator from '../../../../modules/paginator/components/Paginator';
import usePaginatorService from '../../../../modules/paginator/services/usePaginatorService';
import Label from '../../../elements/label/Label';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import InfoBox from '../../../elements/info-box/InfoBox';
import RequesterImportStatusFilter from '../../requester-imports/elements/RequesterImportStatusFilter';
import ProfileVoucherAwardRow from './ProfileVoucherAwardRow';
import { ProfileVoucherAwardOutcome } from '../../../../services/VoucherService';
import { estimatedProfileColumns, profileColumns } from '../constants';

export default function ProfileVoucherAwardResultsCard({
    results,
    fundCount,
    footer,
    estimated = false,
    notice,
    title,
    options,
}: {
    results: ProfileVoucherAwardOutcome[];
    fundCount: number;
    footer?: ReactNode;
    estimated?: boolean;
    notice?: ReactNode;
    title?: string;
    options?: ReactNode;
}) {
    const translate = useTranslate();

    const paginatorService = usePaginatorService();

    const [status, setStatus] = useState('all');
    const [shownIds, setShownIds] = useState<number[]>([]);
    const [paginatorKey] = useState(estimated ? 'profile_voucher_preview' : 'profile_voucher_results');

    const overview = useMemo(() => {
        return {
            profiles: Object.values(groupBy(results, 'profile_id')),
            counts: countBy(results, 'status'),
        };
    }, [results]);

    const filteredProfiles = useMemo(() => {
        return Object.values(
            groupBy(
                results.filter((result) => status === 'all' || result.status === status),
                'profile_id',
            ),
        );
    }, [results, status]);

    const [filterValues, , filterUpdate] = useFilterNext({
        page: 1,
        per_page: paginatorService.getPerPage(paginatorKey, 10),
    });

    const meta = useMemo((): ApiPaginationMetaProp => {
        return {
            total: filteredProfiles.length,
            current_page: filterValues.page,
            per_page: filterValues.per_page,
            last_page: Math.max(1, Math.ceil(filteredProfiles.length / filterValues.per_page)),
            from: filteredProfiles.length ? (filterValues.page - 1) * filterValues.per_page + 1 : 0,
            to: Math.min(filterValues.page * filterValues.per_page, filteredProfiles.length),
            path: '',
            links: { active: false, label: '', url: '' },
        };
    }, [filterValues.page, filterValues.per_page, filteredProfiles.length]);

    const toggleProfile = useCallback((profileId: number) => {
        setShownIds((ids) => {
            return ids.includes(profileId) ? ids.filter((id) => id !== profileId) : [...ids, profileId];
        });
    }, []);

    return (
        <div
            className="card card-collapsed"
            data-dusk={estimated ? 'profileVoucherAwardEstimatedCard' : 'profileVoucherAwardResultsCard'}>
            <div className="card-header">
                <div className="card-title flex flex-grow">
                    {title ||
                        (estimated
                            ? translate('vouchers.from_profiles.preview_estimate.title')
                            : translate('vouchers.from_profiles.results_title'))}
                </div>

                <RequesterImportStatusFilter
                    value={status}
                    values={results.map((result) => result.status)}
                    labels={
                        estimated
                            ? {
                                  eligible: translate('vouchers.from_profiles.preview_estimate.eligible'),
                                  skipped: translate('vouchers.from_profiles.preview_estimate.skipped'),
                                  failed: translate('vouchers.from_profiles.preview_estimate.failed'),
                              }
                            : {
                                  created: translate('vouchers.from_profiles.created'),
                                  skipped: translate('vouchers.from_profiles.skipped'),
                                  failed: translate('vouchers.from_profiles.failed'),
                              }
                    }
                    onChange={(value) => {
                        setStatus(value);
                        filterUpdate({ page: 1 });
                    }}
                />
            </div>

            {notice}

            <div className="card-section">
                <div className="flex flex-vertical flex-gap">
                    {estimated && (
                        <InfoBox>
                            <p>{translate('vouchers.from_profiles.preview_estimate.notice')}</p>
                        </InfoBox>
                    )}

                    <div className="text-semibold">
                        {translate('vouchers.from_profiles.preview_table.summary', {
                            profiles: overview.profiles.length,
                            funds: fundCount,
                        })}
                    </div>
                    <div className="label-group">
                        <Label type="success">
                            {estimated
                                ? translate('vouchers.from_profiles.preview_estimate.eligible')
                                : translate('vouchers.from_profiles.created_awards')}
                            : {(overview.counts.created || 0) + (overview.counts.eligible || 0)}
                        </Label>
                        <Label type="default">
                            {estimated
                                ? translate('vouchers.from_profiles.preview_estimate.skipped')
                                : translate('vouchers.from_profiles.skipped_awards')}
                            : {overview.counts.skipped || 0}
                        </Label>
                        <Label type="danger">
                            {estimated
                                ? translate('vouchers.from_profiles.preview_estimate.failed')
                                : translate('vouchers.from_profiles.failed_awards')}
                            : {overview.counts.failed || 0}
                        </Label>
                    </div>
                    {estimated && !overview.counts.eligible && (
                        <InfoBox>
                            <p>{translate('vouchers.from_profiles.preview_states.no_eligible')}</p>
                        </InfoBox>
                    )}
                    {!estimated && results.length === 0 && (
                        <div className="card-text">{translate('vouchers.from_profiles.empty')}</div>
                    )}
                    {!estimated && overview.counts.failed > 0 && (
                        <InfoBox iconType="warning" iconColor="warning">
                            <p>{translate('vouchers.from_profiles.partial_failure')}</p>
                        </InfoBox>
                    )}
                </div>
            </div>

            {results.length > 0 && (
                <Fragment>
                    <LoaderTableCard
                        columns={estimated ? estimatedProfileColumns : profileColumns}
                        empty={filteredProfiles.length === 0}
                        emptyTitle={translate('requester_imports.status_filter.empty')}>
                        {filteredProfiles.slice(meta.from - 1, meta.to).map((results) => (
                            <ProfileVoucherAwardRow
                                key={results[0].profile_id}
                                results={results}
                                estimated={estimated}
                                expanded={shownIds.includes(results[0].profile_id)}
                                onToggle={() => toggleProfile(results[0].profile_id)}
                            />
                        ))}
                    </LoaderTableCard>

                    {filteredProfiles.length > 0 && (
                        <div className="card-section">
                            <Paginator
                                meta={meta}
                                filters={filterValues}
                                updateFilters={filterUpdate}
                                perPageKey={paginatorKey}
                            />
                        </div>
                    )}
                </Fragment>
            )}

            {options && <div className="card-section card-section-compact">{options}</div>}

            {footer && <div className="card-footer card-footer-primary">{footer}</div>}
        </div>
    );
}
