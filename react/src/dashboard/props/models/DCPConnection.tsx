export interface DCPConnectionTag {
    key: string;
    source?: string;
    value?: string;
    required?: boolean;
    format?: string;
    max?: number;
}

export interface DCPConnectionOrderType {
    label: string;
    item?: string;
    tags: Array<DCPConnectionTag>;
}

export interface DCPConnectionOptions {
    urls: Array<string>;
    orderable_types: Array<{
        key: string;
        name: string;
        source_fields: Array<{ key: string; name: string }>;
    }>;
    formats: Array<{ key: string; name: string }>;
}

export default interface DCPConnection {
    id?: number;
    implementation_id: number;
    enabled: boolean;
    url?: string;
    username?: string;
    has_password: boolean;
    order_types: { [type: string]: DCPConnectionOrderType };
    is_active: boolean;
    created_at?: string;
    created_at_locale?: string;
    updated_at?: string;
    updated_at_locale?: string;
}
