import Fund from './Fund';
import PrevalidationRequestRecord from './PrevalidationRequestRecord';

export interface PrevalidationMissedRecord {
    id: number;
    group: string;
    type: string;
    field: string;
}

export interface PrevalidationRequestRecordGroup {
    id: number;
    title: string;
    organization_id?: number;
    fund_id?: number;
    order: number;
    record_ids: Array<number>;
}

export default interface PrevalidationRequest {
    id: number;
    fund_id: number;
    state: string;
    bsn: string;
    identity_address: string;
    failed_reason?: string;
    failed_reason_locale?: string;
    records?: Array<PrevalidationRequestRecord>;
    record_groups?: Array<PrevalidationRequestRecordGroup>;
    fund?: Fund;
    employee: {
        id: number;
        email?: string;
        identity_address: string;
        organization_id: number;
    };
    missed_records?: Array<PrevalidationMissedRecord>;
    missing_records_approved?: boolean;
}
