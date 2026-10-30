import RecordType from './RecordType';

export type RequesterImportRecordType = Omit<RecordType, 'key'> & { key: string };

export type RequesterImportInput = { bsn: string; [key: string]: string | null };

export type RequesterImportOutcome =
    | { index: number; status: 'created' | 'updated' | 'unchanged'; id: number }
    | { index: number; status: 'failed'; code: string; errors?: Record<string, string[]>; diagnostic_id?: string };

export default interface RequesterImportRow {
    id: number;
    organization_id: number;
    bsn: string;
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
    records: Array<{
        id: number;
        record_type_key: string;
        value: string;
        created_at: string;
        created_at_locale: string;
        updated_at: string;
        updated_at_locale: string;
    }>;
}
