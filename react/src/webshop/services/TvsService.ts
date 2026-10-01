import { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';

export class TvsService {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService = new ApiRequestService()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/tvs';

    public start(data: object): Promise<ResponseSimple<{ redirect_url: string }>> {
        return this.apiRequest.post(this.prefix, data);
    }

    public startFundRequest(organization_id: number, fund_id: number) {
        return this.start({ request: 'fund_request', organization_id, fund_id });
    }

    public startAuthRestore(organization_id: number) {
        return this.start({ request: 'auth', organization_id });
    }
}

export function useTvsService(): TvsService {
    return useState(new TvsService())[0];
}
