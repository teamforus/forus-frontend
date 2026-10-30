import React from 'react';
import useTranslate from '../../../../../../hooks/useTranslate';
import TableTopScroller from '../../../../../elements/tables/TableTopScroller';
import { RequesterImportCsv, RequesterImportUploadResult } from '../types';

export default function RequesterImportUploadResults({
    csv,
    results,
    busy,
}: {
    csv: RequesterImportCsv;
    results: RequesterImportUploadResult[];
    busy: boolean;
}) {
    const translate = useTranslate();

    const labels: Record<RequesterImportUploadResult['status'], string> = {
        created: translate('requester_imports.results.created'),
        updated: translate('requester_imports.results.updated'),
        unchanged: translate('requester_imports.results.unchanged'),
        failed: translate('requester_imports.results.failed'),
        unknown: translate('requester_imports.results.unknown'),
        unsubmitted: busy
            ? translate('requester_imports.results.pending')
            : translate('requester_imports.results.unsubmitted'),
    };

    return (
        <div className="modal-section">
            <p role="status" aria-live="polite">
                {Object.entries(labels)
                    .map(
                        ([status, label]) => `${label}: ${results.filter((result) => result.status === status).length}`,
                    )
                    .join(' · ')}
            </p>
            {results.some(({ status }) => status === 'unknown') && (
                <p role="alert">{translate('requester_imports.unknown_recovery')}</p>
            )}
            {!busy && results.some(({ status }) => status === 'failed' || status === 'unsubmitted') && (
                <p>{translate('requester_imports.retry_description')}</p>
            )}
            <TableTopScroller>
                <table className="table">
                    <thead>
                        <tr>
                            <th>{translate('requester_imports.labels.row')}</th>
                            <th>{translate('requester_imports.labels.bsn')}</th>
                            <th>{translate('requester_imports.labels.result')}</th>
                            <th>{translate('requester_imports.labels.error')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map(({ index, status, message, diagnosticId }) => (
                            <tr key={index}>
                                <td>{csv.rowNumbers[index]}</td>
                                <td>{csv.rows[index].bsn}</td>
                                <td>{labels[status]}</td>
                                <td>
                                    {message || '-'}
                                    {diagnosticId && (
                                        <div>
                                            {translate('requester_imports.diagnostic_reference', {
                                                reference: diagnosticId,
                                            })}
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </TableTopScroller>
        </div>
    );
}
