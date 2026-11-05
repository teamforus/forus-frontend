import { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import DigiDBrowserService from './digid/DigiDBrowserService';
import { DigiDConnection, DigiDStartResponse } from './digid/types';

export class DigiDService {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService = new ApiRequestService()) {}

    public start(connection: DigiDConnection, data: object): Promise<ResponseSimple<DigiDStartResponse>> {
        return new DigiDBrowserService(this.apiRequest).start(connection.transport, {
            ...data,
            ...(connection.transport === 'tvs' ? { organization_id: connection.organization_id } : {}),
        });
    }

    public startFundRequest(fund_id: number, connection: DigiDConnection) {
        return this.start(connection, { fund_id, request: 'fund_request' });
    }

    public startAuthRestore(connection: DigiDConnection) {
        return this.start(connection, { request: 'auth' });
    }
}

export function useDigiDService(): DigiDService {
    return useState(new DigiDService())[0];
}
