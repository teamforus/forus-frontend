import RecordType from './RecordType';

export type RequesterImportRecordType = Omit<RecordType, 'key'> & { key: string };

export type RequesterImportInput = { bsn: string; [key: string]: string | null };

export type RequesterImportRecordChange = {
    record_type_key: string;
    previous_value: string | null;
    value: string;
    action: 'add' | 'update' | 'clear';
};

export type RequesterImportPreviewOutcome = {
    index: number;
    id: number | null;
    action: 'create' | 'update' | 'unchanged';
    changes: RequesterImportRecordChange[];
};

export type RequesterImportOutcome =
    | {
          index: number;
          status: 'created' | 'updated' | 'unchanged';
          id: number;
          changes: RequesterImportRecordChange[];
      }
    | { index: number; status: 'failed'; code: string; errors?: Record<string, string[]>; diagnostic_id?: string };

export type RequesterImportSyncPreview = {
    id: number;
    bsn: string;
    profile_id: number | null;
    action: 'create' | 'update' | 'unchanged' | 'blocked';
    changes: {
        record_type_key: string;
        current_value: string | null;
        value: string;
        action: 'add' | 'update' | 'clear' | 'confirm_source';
    }[];
    errors: Record<string, string[]>;
    code: string | null;
    diagnostic_id: string | null;
};

export type RequesterImportSyncOutcome =
    | {
          id: number;
          bsn: string;
          profile_id: number;
          identity_id: number;
          status: 'created' | 'updated' | 'unchanged';
          records_synced: number;
          records_updated: number;
      }
    | {
          id: number;
          bsn: string;
          status: 'failed';
          code: string;
          errors: Record<string, string[]>;
          diagnostic_id: string;
      };

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
