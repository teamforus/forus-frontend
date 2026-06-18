import { useState } from 'react';
import ApiRequestService from './ApiRequestService';
import ApiResponse, { ApiResponseSingle, RequestConfig } from '../props/ApiResponses';
import { ConfigurableTableColumn } from '../components/pages/vouchers/hooks/useConfigurableTable';
import PrevalidationRequest from '../props/models/PrevalidationRequest';
import Note from '../props/models/Note';
import IdentitiesApiPerson from '../props/models/IdentitiesApiPerson';

export class PrevalidationRequestService<T = PrevalidationRequest> {
    /**
     * @param apiRequest
     */
    public constructor(protected apiRequest: ApiRequestService<T> = new ApiRequestService<T>()) {}

    /**
     * Url prefix
     *
     * @param data
     */
    public prefix = '/platform/organizations';

    public list(organization_id: number, filters: object = {}, config: RequestConfig = {}): Promise<ApiResponse<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests`, filters, config);
    }

    public storeBatch(
        organization_id: number,
        data: Array<{ [key: string]: string }>,
        fund_id: number = null,
        file?: object,
    ): Promise<T> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/prevalidation-requests/collection`, {
            data: data,
            fund_id: fund_id,
            file,
        });
    }

    public storeBatchValidate(
        organization_id: number,
        data: Array<{ [key: string]: string }>,
        fund_id: number = null,
    ): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.post(`${this.prefix}/${organization_id}/prevalidation-requests/collection/validate`, {
            data: data,
            fund_id: fund_id,
        });
    }

    public read(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests/${id}`);
    }

    public resubmitFailed(organization_id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests/resubmit-failed`);
    }

    public resubmit(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.get(`${this.prefix}/${organization_id}/prevalidation-requests/${id}/resubmit`);
    }

    public destroy(organization_id: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.delete(`${this.prefix}/${organization_id}/prevalidation-requests/${id}`);
    }

    public notes(
        organizationId: number,
        id: number,
        data: object = {},
        config: RequestConfig = {},
    ): Promise<ApiResponse<Note>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/prevalidation-requests/${id}/notes`, data, config);
    }

    public noteDestroy(organizationId: number, id: number, note_id: number): Promise<ApiResponseSingle<null>> {
        return this.apiRequest.delete(`${this.prefix}/${organizationId}/prevalidation-requests/${id}/notes/${note_id}`);
    }

    public storeNote(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<Note>> {
        return this.apiRequest.post(`${this.prefix}/${organizationId}/prevalidation-requests/${id}/notes`, data);
    }

    public updateRecord(organizationId: number, id: number, record_id: number, data: object = {}) {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/prevalidation-requests/${id}/records/${record_id}`,
            data,
        );
    }

    public approveMissedRecords(organizationId: number, id: number, data: object = {}): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(
            `${this.prefix}/${organizationId}/prevalidation-requests/${id}/approve-missed-records`,
            data,
        );
    }

    public finalize(organizationId: number, id: number): Promise<ApiResponseSingle<T>> {
        return this.apiRequest.patch(`${this.prefix}/${organizationId}/prevalidation-requests/${id}/finalize`);
    }

    public getPersonBsn(
        organizationId: number,
        id: number,
        data: object = {},
    ): Promise<ApiResponseSingle<IdentitiesApiPerson>> {
        return this.apiRequest.get(`${this.prefix}/${organizationId}/prevalidation-requests/${id}/person`, data);
    }

    public getColumns(): Array<ConfigurableTableColumn> {
        const list = ['bsn', 'fund', 'employee', 'state', 'failed_reason'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `prevalidation_requests.labels.${key}`,
            tooltip: {
                key: key,
                title: `prevalidation_requests.labels.${key}`,
                description: `prevalidation_requests.tooltips.${key}`,
            },
        }));
    }

    public getRecordGroupsColumns(): Array<ConfigurableTableColumn> {
        const list = ['group_title'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `prevalidation_requests.details.labels.${key}`,
            tooltip: {
                key: key,
                title: `prevalidation_requests.details.labels.${key}`,
                description: `prevalidation_requests.details.tooltips.${key}`,
            },
        }));
    }

    public getRecordsColumns(): Array<ConfigurableTableColumn> {
        const list = ['type', 'value', 'source'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `prevalidation_requests.details.labels.${key}`,
            tooltip: {
                key: key,
                title: `prevalidation_requests.details.labels.${key}`,
                description: `prevalidation_requests.details.tooltips.${key}`,
            },
        }));
    }

    public getRecordChangesColumns(): Array<ConfigurableTableColumn> {
        const list = ['new_value', 'old_value', 'employee', 'date_changed'].filter((item) => item);

        return list.map((key) => ({
            key,
            label: `prevalidation_requests.details.labels.${key}`,
            tooltip: {
                key: key,
                title: `prevalidation_requests.details.labels.${key}`,
                description: `prevalidation_requests.details.tooltips.${key}`,
            },
        }));
    }
}

export function usePrevalidationRequestService(): PrevalidationRequestService {
    return useState(new PrevalidationRequestService())[0];
}
