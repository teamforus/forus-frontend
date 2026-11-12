import { useCallback, useEffect, useRef, useState } from 'react';
import Organization, { Permission } from '../../props/models/Organization';
import FundRequest, { FundRequestProfileCopyPreview } from '../../props/models/FundRequest';
import { hasPermission } from '../../helpers/utils';
import { ModalState } from '../../modules/modals/context/ModalContext';
import { useFundRequestValidatorService } from '../../services/FundRequestValidatorService';
import usePushApiError from '../usePushApiError';
import { ResponseError } from '../../props/ApiResponses';

export default function useFundRequestProfileCopy(
    organization: Organization,
    fundRequest: FundRequest,
    modal: ModalState,
) {
    const pushApiError = usePushApiError();

    const fundRequestService = useFundRequestValidatorService();

    const [previewLoading, setPreviewLoading] = useState(false);
    const [copyToProfile, setCopyToProfileState] = useState(true);
    const [preview, setPreview] = useState<FundRequestProfileCopyPreview>(null);

    const requestIdRef = useRef(0);

    const canCopyToProfile = Boolean(
        organization.allow_profiles &&
        fundRequest.fund.allow_fund_request_profile_copy &&
        hasPermission(organization, Permission.MANAGE_IDENTITIES),
    );

    const shouldCopyToProfile = canCopyToProfile && copyToProfile;
    const profileCopyReady = !shouldCopyToProfile || (!previewLoading && preview !== null);

    const setCopyToProfile = useCallback((checked: boolean) => {
        requestIdRef.current += 1;
        setPreview(null);
        setCopyToProfileState(checked);
    }, []);

    const closeModal = useCallback(() => {
        if (modal.processing) {
            return;
        }

        requestIdRef.current += 1;
        modal.close();
    }, [modal]);

    useEffect(() => {
        let active = true;
        const requestId = ++requestIdRef.current;

        setPreview(null);

        if (!shouldCopyToProfile) {
            setPreviewLoading(false);
            return;
        }

        setPreviewLoading(true);

        fundRequestService
            .profileCopyPreview(organization.id, fundRequest.id)
            .then((response) => {
                if (active && requestId === requestIdRef.current) {
                    setPreview(response.data);
                }
            })
            .catch((error: ResponseError) => {
                if (active && requestId === requestIdRef.current) {
                    pushApiError(error);
                }
            })
            .finally(() => {
                if (active && requestId === requestIdRef.current) {
                    setPreviewLoading(false);
                }
            });

        return () => {
            active = false;
        };
    }, [fundRequest.id, fundRequestService, organization.id, pushApiError, shouldCopyToProfile]);

    return {
        canCopyToProfile,
        copyToProfile: shouldCopyToProfile,
        setCopyToProfile,
        preview,
        previewLoading,
        profileCopyReady,
        closeModal,
    };
}
