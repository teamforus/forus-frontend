import { RequesterImportInput } from '../../../../../props/models/RequesterImportRow';

export type RequesterImportCsvError = { row?: number; column?: string; message: string };

export type RequesterImportUploadResult = {
    index: number;
    status: 'created' | 'updated' | 'unchanged' | 'failed' | 'unknown' | 'unsubmitted';
    message?: string;
    diagnosticId?: string;
};

export type RequesterImportCsv = {
    headers: string[];
    rows: RequesterImportInput[];
    rowNumbers: number[];
    errors: RequesterImportCsvError[];
};
