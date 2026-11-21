import VoucherPassType from './VoucherPassType';

export interface VoucherPassInput {
    external_id: string | null;
    owner_bsn: string;
    target_bsn: string;
    type_names: string[];
    fund_ids: number[];
    print_label: string;
    state: 'active' | 'deactivated';
    print_requested: boolean;
}

export default interface VoucherPass extends Omit<VoucherPassInput, 'type_names'> {
    id: number;
    organization_id: number;
    owner_identity_id: number;
    target_identity_id: number;
    code: string;
    employee_id: number | null;
    employee_email: string | null;
    types: VoucherPassType[];
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
}

export interface VoucherPassConfiguration {
    columns: Record<
        keyof VoucherPassInput,
        {
            column: string;
            required: boolean;
            normalize?: 'bsn';
            values?: Record<string, string | boolean>;
        }
    >;
    types: VoucherPassType[];
}

export interface VoucherPassChange {
    field: keyof VoucherPassInput;
    previous_value: string | boolean | string[] | number[] | null;
    value: string | boolean | string[] | number[] | null;
    action: 'add' | 'update' | 'clear';
}

export interface VoucherPassPreview {
    index: number;
    id: number | null;
    code: string | null;
    action: 'create' | 'update' | 'unchanged';
    changes: VoucherPassChange[];
}

export type VoucherPassOutcome =
    | {
          index: number;
          id: number;
          code: string;
          status: 'created' | 'updated' | 'unchanged';
          changes: VoucherPassChange[];
      }
    | {
          index: number;
          status: 'failed';
          code: string;
          message?: string;
          errors?: Record<string, string[]>;
          diagnostic_id?: string;
      };
