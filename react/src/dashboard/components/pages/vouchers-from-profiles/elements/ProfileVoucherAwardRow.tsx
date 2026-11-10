import React, { Fragment } from 'react';
import { countBy } from 'lodash';
import useTranslate from '../../../../hooks/useTranslate';
import { ProfileVoucherAwardOutcome } from '../../../../services/VoucherService';
import TableEntityMain from '../../../elements/tables/elements/TableEntityMain';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import Label, { LabelType } from '../../../elements/label/Label';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';
import { fundColumns, profileColumns } from '../constants';

export default function ProfileVoucherAwardRow({
    results,
    expanded,
    estimated = false,
    onToggle,
}: {
    results: ProfileVoucherAwardOutcome[];
    expanded: boolean;
    estimated?: boolean;
    onToggle: () => void;
}) {
    const translate = useTranslate();

    const counts = countBy(results, 'status');
    const profile = results[0];
    const profileLabel = translate('vouchers.from_profiles.profile', { id: profile.identity_id });
    const subtitle = [
        profile.profile_name ? profileLabel : null,
        profile.client_number
            ? translate('vouchers.from_profiles.client_number', { number: profile.client_number })
            : null,
    ]
        .filter(Boolean)
        .join(' · ');

    const labelTypes: Record<ProfileVoucherAwardOutcome['status'], LabelType> = {
        eligible: 'success',
        created: 'success',
        skipped: 'default',
        failed: 'danger',
    };

    return (
        <Fragment>
            <tr className="tr-clickable" onClick={onToggle}>
                <td className="td-grow">
                    <TableEntityMain
                        title={profile.profile_name || profileLabel}
                        subtitle={subtitle}
                        collapsed={!expanded}
                        collapsedClicked={(event) => {
                            event.stopPropagation();
                            onToggle();
                        }}
                    />
                </td>
                <td>{(counts.created || 0) + (counts.eligible || 0)}</td>
                <td>{counts.skipped || 0}</td>
                <td>{counts.failed || 0}</td>
                <td className="table-td-actions" />
            </tr>

            {expanded && (
                <tr>
                    <td colSpan={profileColumns.length + 1} className="td-paddless">
                        <LoaderTableCard columns={fundColumns}>
                            {results.map((result) => (
                                <tr key={result.fund_id} className="tr-gray tr-narrow">
                                    <td>{result.fund_name}</td>
                                    <td className="td-grow text-white-space-normal">
                                        <div className="flex flex-vertical flex-gap-xs">
                                            {result.status === 'eligible' ? (
                                                <div>
                                                    {translate('vouchers.from_profiles.preview_estimate.quantity', {
                                                        count: result.voucher_count,
                                                    })}
                                                </div>
                                            ) : result.status === 'created' ? (
                                                <div>
                                                    {translate('vouchers.from_profiles.voucher_ids', {
                                                        ids: result.voucher_ids.join(', '),
                                                    })}
                                                </div>
                                            ) : (
                                                <div>{result.message}</div>
                                            )}

                                            {result.errors.map((error, index) => (
                                                <div key={index}>{error}</div>
                                            ))}

                                            {result.diagnostic_id && (
                                                <BlockInlineCopy
                                                    className="flex-self-start"
                                                    value={result.diagnostic_id}>
                                                    {translate('vouchers.from_profiles.diagnostic_reference', {
                                                        reference: result.diagnostic_id,
                                                    })}
                                                </BlockInlineCopy>
                                            )}
                                        </div>
                                    </td>
                                    <td colSpan={2} className="table-td-actions text-right">
                                        <Label type={labelTypes[result.status]}>
                                            {estimated
                                                ? translate(`vouchers.from_profiles.preview_estimate.${result.status}`)
                                                : translate(`vouchers.from_profiles.${result.status}`)}
                                        </Label>
                                    </td>
                                </tr>
                            ))}
                        </LoaderTableCard>
                    </td>
                </tr>
            )}
        </Fragment>
    );
}
