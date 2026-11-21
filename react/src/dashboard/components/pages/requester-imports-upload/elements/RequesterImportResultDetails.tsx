import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';
import LoaderTableCard from '../../../elements/loader-table-card/LoaderTableCard';
import TableEmptyValue from '../../../elements/table-empty-value/TableEmptyValue';
import Label from '../../../elements/label/Label';
import { changeLabelTypes, savedChangeColumns } from '../constants';
import { RequesterImportUploadOutcome } from '../types';

export default function RequesterImportResultDetails({
    result,
    recordNames,
}: {
    result: RequesterImportUploadOutcome;
    recordNames: Record<string, string>;
}) {
    const translate = useTranslate();

    if (result.status === 'created' || result.status === 'updated' || result.status === 'unchanged') {
        return (
            <>
                <div className="card-section">
                    <div className="card-text">
                        {translate(`requester_imports.upload.results.details.${result.status}`)}
                    </div>
                </div>

                {result.changes.length > 0 && (
                    <LoaderTableCard columns={savedChangeColumns} tableOptions={{ hasTooltips: false }}>
                        {result.changes.map((change) => (
                            <tr key={change.record_type_key} className="tr-gray tr-narrow">
                                <td>{recordNames[change.record_type_key] || change.record_type_key}</td>
                                <td>{change.previous_value || <TableEmptyValue />}</td>
                                <td>{change.value || <TableEmptyValue />}</td>
                                <td className="text-right">
                                    <Label type={changeLabelTypes[change.action]}>
                                        {translate(`requester_imports.upload.results.actions.${change.action}`)}
                                    </Label>
                                </td>
                            </tr>
                        ))}
                    </LoaderTableCard>
                )}
            </>
        );
    }

    return (
        <div className="card-section">
            <div className="flex flex-vertical flex-gap-xs">
                {result.status === 'failed' ? (
                    <>
                        <div className="card-text">
                            {result.code === 'batch_rejected'
                                ? translate('requester_imports.errors.batch_rejected')
                                : result.code === 'duplicate_identifier'
                                  ? translate('requester_imports.errors.identifier_conflict')
                                  : translate('requester_imports.errors.row_failed')}
                        </div>

                        {Object.entries(result.errors || {}).map(([key, messages]) => (
                            <div key={key} className="card-text">
                                {recordNames[key] || key}: {messages.join(' ')}
                            </div>
                        ))}

                        {result.diagnostic_id && (
                            <BlockInlineCopy className="flex-self-start" value={result.diagnostic_id}>
                                {translate('requester_imports.diagnostic_reference', {
                                    reference: result.diagnostic_id,
                                })}
                            </BlockInlineCopy>
                        )}
                    </>
                ) : (
                    <div className="card-text">
                        {result.status === 'unknown'
                            ? translate('requester_imports.errors.unknown')
                            : result.status === 'skipped'
                              ? translate('requester_imports.skipped_description')
                              : translate('requester_imports.upload.results.details.unsubmitted')}
                    </div>
                )}
            </div>
        </div>
    );
}
