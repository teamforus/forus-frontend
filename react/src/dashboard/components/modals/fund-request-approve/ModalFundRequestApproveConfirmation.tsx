import React from 'react';
import { ModalState } from '../../../modules/modals/context/ModalContext';
import Organization from '../../../props/models/Organization';
import FundRequest from '../../../props/models/FundRequest';
import { ResponseError } from '../../../props/ApiResponses';
import { useFundRequestValidatorService } from '../../../services/FundRequestValidatorService';
import useTranslate from '../../../hooks/useTranslate';
import useFundRequestProfileCopy from '../../../hooks/fund-requests/useFundRequestProfileCopy';
import ModalNotification from '../ModalNotification';
import CheckboxControl from '../../elements/forms/controls/CheckboxControl';
import FundRequestProfileCopyPreview from './elements/FundRequestProfileCopyPreview';

export default function ModalFundRequestApproveConfirmation({
    modal,
    fundRequest,
    activeOrganization,
    onDone,
    onError,
}: {
    modal: ModalState;
    fundRequest: FundRequest;
    activeOrganization: Organization;
    onDone: () => void;
    onError: (err: ResponseError) => void;
}) {
    const translate = useTranslate();

    const fundRequestService = useFundRequestValidatorService();

    const { canCopyToProfile, copyToProfile, setCopyToProfile, preview, previewLoading, profileCopyReady, closeModal } =
        useFundRequestProfileCopy(activeOrganization, fundRequest, modal);

    return (
        <ModalNotification
            modal={{ ...modal, close: closeModal }}
            className={canCopyToProfile ? 'modal-lg' : 'modal-md'}
            title="Weet u zeker dat u deze persoonsgegeven wil goedkeuren?"
            description="Een beoordeling kan niet ongedaan gemaakt worden. Kijk goed of u deze actie wilt verrichten."
            buttonCancel={{ onClick: closeModal }}
            buttonSubmit={{
                onClick: (_e, setDisabled) => {
                    if (modal.processing || !profileCopyReady) {
                        return;
                    }

                    setDisabled(true);
                    modal.setProcessing(true);

                    fundRequestService
                        .approve(activeOrganization.id, fundRequest.id, {
                            copy_to_profile: copyToProfile,
                        })
                        .then(() => {
                            modal.setProcessing(false);
                            onDone();
                        })
                        .catch((err: ResponseError) => {
                            modal.setProcessing(false);
                            setDisabled(false);
                            onError(err);
                        })
                        .finally(() => setTimeout(closeModal));
                },
            }}
            submitDisabled={!profileCopyReady}>
            {canCopyToProfile && (
                <div className="block block-approve-fund-request">
                    <div className="form">
                        <CheckboxControl
                            checked={copyToProfile}
                            disabled={modal.processing}
                            dusk="copyToProfile"
                            narrow
                            onChange={(_, checked) => setCopyToProfile(checked)}
                            title={translate('validation_request_details.labels.copy_to_profile')}
                        />
                    </div>

                    <FundRequestProfileCopyPreview enabled={copyToProfile} loading={previewLoading} preview={preview} />
                </div>
            )}
        </ModalNotification>
    );
}
