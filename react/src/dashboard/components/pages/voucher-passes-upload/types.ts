import { VoucherPassInput, VoucherPassOutcome } from '../../../props/models/VoucherPass';

export type VoucherPassCsvError = { row?: number; column?: string; message: string };

export type VoucherPassCsv = {
    headers: string[];
    columnNames: Record<string, string>;
    rows: VoucherPassInput[];
    rowNumbers: number[];
    errors: VoucherPassCsvError[];
};

export type VoucherPassUploadOutcome =
    | VoucherPassOutcome
    | {
          index: number;
          status: 'unknown' | 'unsubmitted' | 'skipped';
      };
