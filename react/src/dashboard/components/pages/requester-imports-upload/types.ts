import { RequesterImportInput, RequesterImportOutcome } from '../../../props/models/RequesterImportRow';

export type RequesterImportCsvError = { row?: number; column?: string; message: string };

export type RequesterImportCsv = {
    headers: string[];
    columnNames: Record<string, string>;
    rows: RequesterImportInput[];
    rowNumbers: number[];
    errors: RequesterImportCsvError[];
};

export type RequesterImportUploadOutcome =
    | RequesterImportOutcome
    | { index: number; status: 'unknown' | 'unsubmitted' | 'skipped' };
