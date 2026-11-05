import { useCallback } from 'react';
import { ResponseError, ResponseSimple } from '../../dashboard/props/ApiResponses';
import usePushDanger from '../../dashboard/hooks/usePushDanger';
import useTranslate from '../../dashboard/hooks/useTranslate';
import { useNavigateState } from '../modules/state_router/Router';
import { WebshopRoutes } from '../modules/state_router/RouterBuilder';
import { DigiDStartResponse } from '../services/digid/types';

export default function useStartDigId() {
    const translate = useTranslate();
    const pushDanger = usePushDanger();
    const navigateState = useNavigateState();

    return useCallback(
        async (startRequest: () => Promise<ResponseSimple<DigiDStartResponse>>): Promise<void> => {
            try {
                const response = await startRequest();
                const data = response.data;

                if (data.type === 'redirect') {
                    window.location.assign(data.redirect_url);
                    return;
                }

                const form = document.createElement('form');
                form.method = 'POST';
                form.action = data.destination;
                form.target = '_self';
                form.hidden = true;

                Object.entries(data.fields).forEach(([name, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = name;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);

                try {
                    form.submit();
                } finally {
                    form.remove();
                }
            } catch (error) {
                const response = error as ResponseError;

                if (response?.status === 403 && response.data?.message) {
                    pushDanger(translate('push.error'), response.data.message);
                    return;
                }

                navigateState(WebshopRoutes.ERROR, {
                    errorCode: response?.headers?.['error-code'] || 'digid_unknown_error',
                });
            }
        },
        [navigateState, pushDanger, translate],
    );
}
