import { useCallback, useState } from 'react';

export default function useAuthToken(): [string | null, (token: string | null) => void] {
    const [token, setTokenState] = useState<string | null>(() => {
        const storedToken = localStorage?.getItem('active_account');

        return storedToken && storedToken !== 'null' ? storedToken : null;
    });

    const setToken = useCallback((token: string | null) => {
        if (token) {
            localStorage.setItem('active_account', token);
        } else {
            localStorage.removeItem('active_account');
        }

        setTokenState(token);
    }, []);

    return [token, setToken];
}
