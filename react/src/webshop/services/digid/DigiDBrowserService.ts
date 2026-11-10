import ApiRequestService from '../../../dashboard/services/ApiRequestService';
import { ResponseSimple } from '../../../dashboard/props/ApiResponses';
import { DigiDCompleteResponse, DigiDStartResponse, DigiDTransport } from './types';

export default class DigiDBrowserService {
    public constructor(protected apiRequest: ApiRequestService<unknown> = new ApiRequestService()) {}

    public async start(transport: DigiDTransport, data: object): Promise<ResponseSimple<DigiDStartResponse>> {
        const verifier = this.toHex(crypto.getRandomValues(new Uint8Array(32)));
        const challenge = this.toHex(
            new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))),
        );
        const pendingKey = this.storageKey(transport, `pending:${challenge}`);

        sessionStorage.setItem(pendingKey, verifier);

        try {
            const response = await this.apiRequest.post<ResponseSimple<DigiDStartResponse>>(`/platform/${transport}`, {
                ...data,
                browser_challenge: challenge,
            });

            sessionStorage.setItem(this.storageKey(transport, response.data.session_uid), verifier);

            return response;
        } finally {
            sessionStorage.removeItem(pendingKey);
        }
    }

    public async complete(
        transport: DigiDTransport,
        sessionUid: string,
        completionCode: string,
    ): Promise<ResponseSimple<DigiDCompleteResponse>> {
        const storageKey = this.storageKey(transport, sessionUid);
        const verifier = sessionStorage.getItem(storageKey);

        if (!verifier) {
            throw new Error('DigiD browser verification is unavailable.');
        }

        try {
            return await this.apiRequest.post<ResponseSimple<DigiDCompleteResponse>>(
                `/platform/${transport}/complete`,
                {
                    session_uid: sessionUid,
                    completion_code: completionCode,
                    browser_verifier: verifier,
                },
            );
        } finally {
            sessionStorage.removeItem(storageKey);
        }
    }

    private storageKey(transport: DigiDTransport, sessionUid: string): string {
        return `digid_browser:${transport}:${sessionUid}`;
    }

    private toHex(bytes: Uint8Array): string {
        return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    }
}
