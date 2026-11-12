import React from 'react';
import useTranslate from '../../hooks/useTranslate';
import CSVProgressBar from '../../components/elements/csv-progress-bar/CSVProgressBar';
import { BatchProgressTiming } from './types';

export default function BatchProgress({
    processed = 0,
    total,
    timing,
    status,
}: {
    processed?: number;
    total?: number;
    timing: BatchProgressTiming;
    status?: string;
}) {
    const translate = useTranslate();

    const formatDuration = (milliseconds: number) => {
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return translate('components.batch_progress.hours', {
                hours,
                minutes: minutes % 60,
                seconds: seconds % 60,
            });
        }

        if (minutes > 0) {
            return translate('components.batch_progress.minutes', { minutes, seconds: seconds % 60 });
        }

        return translate('components.batch_progress.seconds', { seconds });
    };

    return (
        <div className="card-section">
            <div className="block block-csv">
                <div className="csv-inner">
                    <div className="csv-upload-progress">
                        <div className="csv-upload-icon">
                            <em className="mdi mdi-loading mdi-spin" />
                        </div>

                        <div role="status" aria-live="polite">
                            {total === undefined ? (
                                <div className="csv-progress-state">{status}</div>
                            ) : (
                                <CSVProgressBar
                                    progressBar={total ? (processed / total) * 100 : 100}
                                    status={
                                        status ||
                                        translate('components.batch_processing.progress', { processed, total })
                                    }
                                />
                            )}
                        </div>

                        <div className="text-muted">
                            {translate('components.batch_progress.elapsed', {
                                duration: formatDuration(timing.elapsedMs),
                            })}

                            {timing.remainingMs !== null && (
                                <>
                                    {' · '}
                                    {translate('components.batch_progress.remaining', {
                                        duration: formatDuration(timing.remainingMs),
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
