export type VoucherPassDCPStatus =
    | 'would_create'
    | 'would_update'
    | 'created'
    | 'updated'
    | 'unchanged'
    | 'skipped'
    | 'blocked'
    | 'failed';

export default interface VoucherPassDCPResult {
    id: number;
    code: string;
    order_id: number | null;
    status: VoucherPassDCPStatus;
    message: string;
    changes: {
        field: string;
        previous_value: string | null;
        value: string;
        action: 'add' | 'update' | 'clear';
    }[];
    errors: string[];
    diagnostic_id: string | null;
}
