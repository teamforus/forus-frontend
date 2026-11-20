import React from 'react';
import useTranslate from '../../../../hooks/useTranslate';
import BlockInlineCopy from '../../../elements/block-inline-copy/BlockInlineCopy';

export default function RequesterImportSyncErrors({
    errors,
    diagnosticId,
}: {
    errors: Record<string, string[]>;
    diagnosticId: string | null;
}) {
    const translate = useTranslate();

    return (
        <div className="flex flex-vertical flex-gap-xs">
            {Object.keys(errors).length > 0 ? (
                Object.entries(errors).map(([key, messages]) => <div key={key}>{messages.join(' ')}</div>)
            ) : (
                <div>{translate('requester_imports.sync_page.row_unavailable')}</div>
            )}

            {diagnosticId && (
                <BlockInlineCopy className="flex-self-start" value={diagnosticId}>
                    {translate('requester_imports.diagnostic_reference', { reference: diagnosticId })}
                </BlockInlineCopy>
            )}
        </div>
    );
}
