import { t } from 'i18next';
export type IdentityProviderHandoffKey = 'entra_exchange' | 'entra_session' | 'entra_error' | 'entra_error_ref';

export function consumeIdentityProviderHandoff(key: IdentityProviderHandoffKey): string | null {
    const search = new URLSearchParams(window.location.search);
    let hash = window.location.hash;
    let changed = search.has(key);
    let value = changed ? search.get(key) : null;

    search.delete(key);

    if (hash.includes('?')) {
        const [hashPath, hashQuery] = hash.split('?', 2);
        const hashParams = new URLSearchParams(hashQuery);

        value ??= hashParams.get(key);
        changed = hashParams.has(key) || changed;
        hashParams.delete(key);
        hash = `${hashPath}${hashParams.size ? `?${hashParams}` : ''}`;
    }

    if (changed) {
        const query = search.size ? `?${search}` : '';

        window.history.replaceState(window.history.state, document.title, `${window.location.pathname}${query}${hash}`);
    }

    return value;
}

export function appendIdentityProviderDiagnosticReference(message: string, reference?: string): string {
    return reference ? t('organizations_identity_provider_entra.ui.with_reference', { message, reference }) : message;
}
