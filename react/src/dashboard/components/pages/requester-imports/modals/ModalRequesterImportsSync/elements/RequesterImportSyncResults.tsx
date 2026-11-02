import React from 'react';
import useTranslate from '../../../../../../hooks/useTranslate';
import { RequesterImportSyncOutcome } from '../../../../../../props/models/RequesterImportRow';
import StateNavLink from '../../../../../../modules/state_router/StateNavLink';
import { DashboardRoutes } from '../../../../../../modules/state_router/RouterBuilder';
import TableTopScroller from '../../../../../elements/tables/TableTopScroller';

export default function RequesterImportSyncResults({
    results,
    organizationId,
    onClose,
}: {
    results: RequesterImportSyncOutcome[];
    organizationId: number;
    onClose: () => void;
}) {
    const translate = useTranslate();

    const labels: Record<RequesterImportSyncOutcome['status'], string> = {
        created: translate('requester_imports.results.created'),
        updated: translate('requester_imports.results.updated'),
        unchanged: translate('requester_imports.results.unchanged'),
        failed: translate('requester_imports.results.failed'),
    };

    return (
        <>
            <p role="status" aria-live="polite">
                {results.length
                    ? Object.entries(labels)
                          .map(
                              ([status, label]) =>
                                  `${label}: ${results.filter((result) => result.status === status).length}`,
                          )
                          .join(' · ')
                    : translate('requester_imports.sync.empty')}
            </p>
            {results.some(({ status }) => status === 'failed') && (
                <p>{translate('requester_imports.sync.retry_description')}</p>
            )}
            {results.length > 0 && (
                <TableTopScroller>
                    <table className="table">
                        <thead>
                            <tr>
                                <th>{translate('requester_imports.labels.bsn')}</th>
                                <th>{translate('requester_imports.sync.profile')}</th>
                                <th>{translate('requester_imports.labels.result')}</th>
                                <th>{translate('requester_imports.sync.fields_updated')}</th>
                                <th>{translate('requester_imports.labels.error')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {results.map((result) => (
                                <tr key={result.id}>
                                    <td>{result.bsn}</td>
                                    <td>
                                        {result.status === 'failed' ? (
                                            '-'
                                        ) : (
                                            <StateNavLink
                                                name={DashboardRoutes.IDENTITY}
                                                params={{ organizationId, id: result.identity_id }}
                                                onClick={onClose}>
                                                {translate('requester_imports.sync.view_profile')}
                                            </StateNavLink>
                                        )}
                                    </td>
                                    <td>{labels[result.status]}</td>
                                    <td>{result.status === 'failed' ? '-' : result.records_updated}</td>
                                    <td>
                                        {result.status === 'failed' ? (
                                            <>
                                                {Object.values(result.errors).flat().join(' ') ||
                                                    translate('requester_imports.sync.row_failed')}
                                                {result.diagnostic_id && (
                                                    <div>
                                                        {translate('requester_imports.diagnostic_reference', {
                                                            reference: result.diagnostic_id,
                                                        })}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </TableTopScroller>
            )}
        </>
    );
}
