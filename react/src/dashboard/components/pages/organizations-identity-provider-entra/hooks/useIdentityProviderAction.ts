import useTranslate from '../../../../hooks/useTranslate';
import { useCallback, useState } from 'react';
import { ResponseError } from '../../../../props/ApiResponses';
import usePushApiError from '../../../../hooks/usePushApiError';
import usePushSuccess from '../../../../hooks/usePushSuccess';
import useSetProgress from '../../../../hooks/useSetProgress';

type IdentityProviderActionOptions<T> = {
    onSuccess?: (response: T) => void;
    onError?: (error: ResponseError) => void;
    successMessage?: string | null;
};

export default function useIdentityProviderAction() {
    const translate = useTranslate();
    const pushSuccess = usePushSuccess();
    const setProgress = useSetProgress();
    const pushApiError = usePushApiError();

    const [busy, setBusy] = useState(false);

    const runAction = useCallback(
        <T>(request: () => Promise<T>, options: IdentityProviderActionOptions<T> = {}) => {
            const {
                onError,
                onSuccess,
                successMessage = translate('organizations_identity_provider_entra.ui.saved'),
            } = options;

            setBusy(true);
            setProgress(0);

            return Promise.resolve()
                .then(request)
                .then((response) => {
                    onSuccess?.(response);

                    if (successMessage) {
                        pushSuccess(successMessage);
                    }
                })
                .catch((error: ResponseError) => {
                    pushApiError(error);
                    onError?.(error);
                })
                .finally(() => {
                    setBusy(false);
                    setProgress(100);
                });
        },
        [pushApiError, pushSuccess, setProgress, translate],
    );

    return { busy, runAction };
}
