import React from 'react';
import useTranslate from '../../../hooks/useTranslate';
import { BatchReport, BatchScope } from '../../../hooks/batch-processing/types';
import InfoBox from '../info-box/InfoBox';

export default function BatchRunNotice<TBatch extends BatchScope>({
    report,
    error,
    describeBatch,
}: {
    report: BatchReport<TBatch> | null;
    error?: string;
    describeBatch: (batch: TBatch) => string;
}) {
    const translate = useTranslate();

    if (
        !error &&
        !report?.missing.length &&
        !report?.new_ids.length &&
        report?.status !== 'interrupted' &&
        report?.status !== 'stopped' &&
        report?.candidate_check !== 'pending' &&
        report?.candidate_check !== 'failed'
    ) {
        return null;
    }

    return (
        <div className="card-section">
            <InfoBox iconType="warning" iconColor="warning">
                {(report?.status === 'interrupted' || report?.status === 'stopped') && (
                    <p>
                        {report.stage === 'execution'
                            ? translate('components.batch_processing.execution_interrupted')
                            : translate('components.batch_processing.preview_interrupted')}
                    </p>
                )}

                {error && <p role="alert">{error}</p>}

                {report?.uncertain && (
                    <p>
                        {report.stage === 'execution'
                            ? translate('components.batch_processing.uncertain')
                            : translate('components.batch_processing.preview_unconfirmed')}
                        <br />
                        {describeBatch(report.uncertain)}
                    </p>
                )}

                {report?.rejected && (
                    <p>
                        {translate('components.batch_processing.rejected')}
                        <br />
                        {describeBatch(report.rejected)}
                    </p>
                )}

                {report?.unsubmitted.length > 0 && (
                    <details>
                        <summary>
                            {translate('components.batch_processing.unsubmitted', {
                                count: report.unsubmitted.reduce((total, batch) => total + batch.ids.length, 0),
                            })}
                        </summary>

                        {report.unsubmitted.map((batch, index) => (
                            <div key={index}>{describeBatch(batch)}</div>
                        ))}
                    </details>
                )}

                {report?.missing.length > 0 && (
                    <details>
                        <summary>
                            {translate('components.batch_processing.missing', {
                                count: report.missing.reduce((total, batch) => total + batch.ids.length, 0),
                            })}
                        </summary>

                        {report.missing.map((batch, index) => (
                            <div key={index}>{describeBatch(batch)}</div>
                        ))}
                    </details>
                )}

                {report?.candidate_check === 'pending' && (
                    <p>{translate('components.batch_processing.checking_candidates')}</p>
                )}

                {report?.candidate_check === 'failed' && (
                    <p>{translate('components.batch_processing.candidate_check_failed')}</p>
                )}

                {report?.new_ids.length > 0 && (
                    <details>
                        <summary>
                            {translate('components.batch_processing.new_candidates', { count: report.new_ids.length })}
                        </summary>

                        <p>{report.new_ids.join(', ')}</p>
                    </details>
                )}
            </InfoBox>
        </div>
    );
}
