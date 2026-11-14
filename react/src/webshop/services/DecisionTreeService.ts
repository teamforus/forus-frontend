import { ResponseSimple } from '../../dashboard/props/ApiResponses';
import { useState } from 'react';
import ApiRequestService from '../../dashboard/services/ApiRequestService';
import { DecisionTreesPayload } from '../components/elements/decision-tree/types/types';

export class DecisionTreeService<T = DecisionTreesPayload> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/decision-trees';

    /**
     * Fetch list
     */
    public list(data: object = {}): Promise<ResponseSimple<T>> {
        return this.apiRequest.get(`${this.prefix}`, data);
    }
}

export function useDecisionTreeService(): DecisionTreeService {
    return useState(new DecisionTreeService())[0];
}
