export type DigiDTransport = 'digid' | 'tvs';

export type DigiDConnection = { transport: 'digid' } | { transport: 'tvs'; organization_id: number };

export type DigiDStartResponse = {
    session_uid: string;
} & (
    | { type: 'redirect'; redirect_url: string }
    | { type: 'post'; destination: string; fields: { SAMLRequest: string; RelayState: string } }
);

export type DigiDCompleteResponse = {
    redirect_url: string;
};
