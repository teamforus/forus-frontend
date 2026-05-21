import RecordType from './RecordType';

export default interface PrevalidationRequestRecord {
    id: number;
    prevalidation_request_id: number;
    record_type_key: string;
    record_type?: RecordType;
    source?: 'file' | 'brp';
    value: string;
    history: Array<{
        id?: string;
        old_value?: string;
        new_value?: string;
        employee_email?: string;
        created_at?: string;
        created_at_locale?: string;
    }>;
}
