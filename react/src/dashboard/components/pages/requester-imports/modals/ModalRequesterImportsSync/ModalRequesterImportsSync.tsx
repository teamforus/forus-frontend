import React, { useCallback, useEffect, useState } from 'react';
import useTranslate from '../../../../../hooks/useTranslate';
import useActiveOrganization from '../../../../../hooks/useActiveOrganization';
import useCanManageRequesterImports from '../../../../../hooks/permissions/useCanManageRequesterImports';
import { useRequesterImportService } from '../../../../../services/RequesterImportService';
import { RequesterImportSyncOutcome } from '../../../../../props/models/RequesterImportRow';
import { ResponseError } from '../../../../../props/ApiResponses';
import { ModalState } from '../../../../../modules/modals/context/ModalContext';
import CheckboxControl from '../../../../elements/forms/controls/CheckboxControl';
import InfoBox from '../../../../elements/info-box/InfoBox';
import { Button } from '../../../../elements/button/Button';
import ModalDangerZone from '../../../../modals/ModalDangerZone';
import Modal from '../../../../modals/elements/Modal';
import RequesterImportSyncResults from './elements/RequesterImportSyncResults';

export default function ModalRequesterImportsSync({
    modal,
    organizationId,
    onChanged,
}: {
    modal: ModalState;
    organizationId: number;
    onChanged: () => void;
}) {
    const [updateAll, setUpdateAll] = useState(false);
    const [phase, setPhase] = useState<'confirm' | 'running' | 'results'>('confirm');
    const [error, setError] = useState<'rejected' | 'unknown'>(null);
    const [results, setResults] = useState<RequesterImportSyncOutcome[]>(null);

    const translate = useTranslate();
    const organization = useActiveOrganization();
    const canManageRequesterImports = useCanManageRequesterImports();
    const requesterImportService = useRequesterImportService();

    const allowed = organization?.id === organizationId && canManageRequesterImports;
    const busy = phase === 'running';
    const canRetry = error === 'rejected' || results?.some(({ status }) => status === 'failed');

    const runSync = useCallback(async () => {
        if (!allowed || busy) {
            return;
        }

        modal.setProcessing(true);
        setPhase('running');
        setResults(null);
        setError(null);

        try {
            const response = await requesterImportService.sync(organizationId, updateAll);

            if (!Array.isArray(response.data?.data)) {
                setError('unknown');
                return;
            }

            setResults(response.data.data);
        } catch (error) {
            const response = error as ResponseError;
            setError([401, 403, 404, 422, 429].includes(response.status) ? 'rejected' : 'unknown');
        } finally {
            modal.setProcessing(false);
            setPhase('results');
            onChanged();
        }
    }, [allowed, busy, modal, onChanged, organizationId, requesterImportService, updateAll]);

    useEffect(() => {
        if (!allowed && !busy) {
            modal.close();
        }
    }, [allowed, busy, modal]);

    if (!allowed) {
        return null;
    }

    if (phase === 'confirm') {
        return (
            <ModalDangerZone
                modal={modal}
                title={translate('requester_imports.sync.title')}
                description={translate('requester_imports.sync.scope')}
                description_text={
                    <>
                        <p>{translate('requester_imports.sync.default_description')}</p>
                        <CheckboxControl
                            checked={updateAll}
                            title={translate('requester_imports.sync.update_all')}
                            onChange={(_, checked) => setUpdateAll(checked)}
                        />
                        <p>{translate('requester_imports.sync.update_all_description')}</p>
                    </>
                }
                buttonCancel={{ text: translate('requester_imports.buttons.cancel'), onClick: modal.close }}
                buttonSubmit={{ text: translate('requester_imports.buttons.sync'), onClick: runSync }}
            />
        );
    }

    return (
        <Modal
            modal={modal}
            size="lg"
            title={translate('requester_imports.sync.results_title')}
            footer={
                <>
                    <Button text={translate('requester_imports.buttons.close')} onClick={modal.close} disabled={busy} />
                    {!busy && canRetry && (
                        <Button
                            type="primary"
                            text={translate('requester_imports.sync.retry')}
                            onClick={() => setPhase('confirm')}
                        />
                    )}
                </>
            }>
            {busy && (
                <p role="status" aria-live="polite">
                    <em className="mdi mdi-loading mdi-spin icon-start" />
                    {translate('requester_imports.sync.running')}
                </p>
            )}
            {error && (
                <InfoBox iconType="warning" iconColor="warning">
                    <p role="alert">
                        {error === 'unknown'
                            ? translate('requester_imports.sync.unknown')
                            : translate('requester_imports.sync.rejected')}
                    </p>
                </InfoBox>
            )}
            {results && (
                <RequesterImportSyncResults results={results} organizationId={organizationId} onClose={modal.close} />
            )}
        </Modal>
    );
}
