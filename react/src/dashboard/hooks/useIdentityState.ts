import { useCallback, useState } from 'react';
import Identity from '../props/models/Identity';
import Identity2FAState from '../props/models/Identity2FAState';
import { useAuthService } from '../services/AuthService';
import { useIdentity2FAService } from '../services/Identity2FAService';

export default function useIdentityState(token: string | null) {
    const authService = useAuthService();
    const identity2FAService = useIdentity2FAService();

    const [identity, setIdentity] = useState<Identity>(null);
    const [identity2FAState, setIdentity2FAState] = useState<Identity2FAState>(null);

    const fetchIdentity = useCallback(async () => {
        const identity = token
            ? await authService
                  .identity()
                  .then((res) => res.data)
                  .catch(() => null)
            : null;

        setIdentity(identity);

        return identity;
    }, [authService, token]);

    const fetchIdentity2FA = useCallback(async () => {
        const identity2FAState = token
            ? await identity2FAService
                  .status()
                  .then((res) => res.data.data)
                  .catch(() => null)
            : null;

        setIdentity2FAState(identity2FAState);

        return identity2FAState;
    }, [identity2FAService, token]);

    const updateIdentity = useCallback(async () => {
        const identity = await fetchIdentity();
        const identity2FAState = await fetchIdentity2FA();

        return { identity, identity2FAState };
    }, [fetchIdentity, fetchIdentity2FA]);

    return { identity, setIdentity, identity2FAState, setIdentity2FAState, fetchIdentity2FA, updateIdentity };
}
