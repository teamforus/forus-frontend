import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { useState } from 'react';
import { ApiResponseSingle, ResponseError, ResponseSimple } from '../../dashboard/props/ApiResponses';
import type { WalletFlow } from '../../dashboard/props/models/WalletFlow';
import WalletDisclosure from '../props/models/WalletDisclosure';

export class WalletService<T = unknown> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    public prefix = '/platform/wallets';

    public errorCode(error: ResponseError): string {
        const code = error.headers?.['error-code'] || 'unknown_error';

        return code.startsWith('wallet_') ? code : `wallet_${code}`;
    }

    public startAuth(target: string | null, flow: WalletFlow): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.start({ target, flow_id: flow.id }, `${this.prefix}/auth`);
    }

    public startFundRequest(
        fund_id: number,
        flow: WalletFlow,
        returnToFundOnError = false,
    ): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.start(
            { fund_id, request: 'fund_request', flow_id: flow.id },
            `${this.prefix}/auth`,
            returnToFundOnError ? fund_id : null,
        );
    }

    public startFundDisclosure(fundId: number): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.start({}, `/platform/funds/${fundId}/wallet-disclosures`, fundId);
    }

    public disclosure(fundId: number, disclosureId: string): Promise<ApiResponseSingle<WalletDisclosure>> {
        return this.apiRequest.get(`/platform/funds/${fundId}/wallet-disclosures/${disclosureId}`);
    }

    public confirmDisclosureEmail(fundId: number, disclosureId: number): Promise<ResponseSimple<null>> {
        return this.apiRequest.post(`/platform/funds/${fundId}/wallet-disclosures/${disclosureId}/email`);
    }

    public async complete(sessionUid: string, ticket: string): Promise<void> {
        const key = `wallet_${sessionUid}`;
        const token = sessionStorage.getItem(key);

        if (!token) {
            throw new Error('ID-Wallet verification was not started in this tab.');
        }

        try {
            const res = await this.apiRequest.post<ResponseSimple<{ redirect_url: string }>>(
                `${this.prefix}/${sessionUid}/complete`,
                { browser_token: token, callback_ticket: ticket },
            );

            window.location.assign(res.data.redirect_url);
        } finally {
            sessionStorage.removeItem(key);
            sessionStorage.removeItem(`${key}_fund`);
        }
    }

    public startDisclosure(flow: WalletFlow): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.start({ flow_id: flow.id }, `${this.prefix}/disclosure`);
    }

    protected start(data: object, url: string, fundId?: number): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest
            .post<
                ResponseSimple<{
                    redirect_url: string;
                    session_uid: string;
                    browser_token: string;
                }>
            >(url, data)
            .then((res) => {
                sessionStorage.setItem(`wallet_${res.data.session_uid}`, res.data.browser_token);

                if (fundId) {
                    sessionStorage.setItem(`wallet_${res.data.session_uid}_fund`, String(fundId));
                }

                return res;
            });
    }
}

export function useWalletService(): WalletService {
    return useState(new WalletService())[0];
}
