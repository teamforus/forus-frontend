export default interface ReservationField {
    id?: number;
    type: 'text' | 'number' | 'boolean' | 'file';
    product_id?: number | null;
    organization_id?: number;
    label: string;
    description: string | null;
    required: boolean;
    order?: number;
    fillable_by?: 'provider' | 'requester';
}
