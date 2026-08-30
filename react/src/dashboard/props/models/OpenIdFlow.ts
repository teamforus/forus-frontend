export type OpenIdProvider = 'verid';

export type OpenIdFlow = {
    id: number;
    provider: OpenIdProvider;
    key: string;
    name: string;
};
