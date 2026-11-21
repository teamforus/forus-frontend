export type RequesterImportMappingColumn = {
    column: string;
    normalize?: 'bsn';
    date_format?: string;
    values?: Record<string, string>;
    required?: boolean;
};

export type RequesterImportConfiguration = {
    key: string;
    columns: Record<string, RequesterImportMappingColumn>;
};
