import { DCPOrderCounts } from './DCPOrder';

export default interface DCPOrderBulk {
    id: number;
    organization_id: number;
    employee_id: number | null;
    employee_email: string | null;
    dcp_orders_count: number;
    counts: DCPOrderCounts;
    submitted_count: number;
    shipped_count: number;
    approved_at: string;
    approved_at_locale: string;
    created_at: string;
    created_at_locale: string;
    updated_at: string;
    updated_at_locale: string;
}
