import { useEffect, useRef, useState } from 'react';
import { StringParam, useQueryParams } from 'use-query-params';
import { useNavigateState } from '../../../modules/state_router/Router';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import DigiDBrowserService from '../../../services/digid/DigiDBrowserService';

export default function DigiDComplete() {
    const [browserService] = useState(() => new DigiDBrowserService());
    const started = useRef(false);
    const navigateState = useNavigateState();

    const [query, setQuery] = useQueryParams({
        transport: StringParam,
        session_uid: StringParam,
        completion_code: StringParam,
    });

    useEffect(() => {
        if (started.current) {
            return;
        }

        started.current = true;
        const { transport, session_uid, completion_code } = query;

        setQuery({ transport: null, session_uid: null, completion_code: null }, 'replaceIn');

        if ((transport !== 'digid' && transport !== 'tvs') || !session_uid || !completion_code) {
            navigateState(WebshopRoutes.ERROR, { errorCode: 'digid_unknown_error' });
            return;
        }

        browserService
            .complete(transport, session_uid, completion_code)
            .then((res) => window.location.assign(res.data.redirect_url))
            .catch(() => navigateState(WebshopRoutes.ERROR, { errorCode: 'digid_unknown_error' }));
    }, [browserService, navigateState, query, setQuery]);

    return null;
}
