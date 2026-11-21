import Papa from 'papaparse';
import { normalizeBsn } from '../../../../helpers/string';
import { VoucherPassConfiguration, VoucherPassInput } from '../../../../props/models/VoucherPass';
import { VoucherPassCsv } from '../types';

export function parseVoucherPassCsv(
    text: string,
    configuration: VoucherPassConfiguration,
    translate: (key: string, options?: object) => string,
): VoucherPassCsv {
    const definitions = Object.entries(configuration.columns);
    const columns = new Map(definitions.map(([key, definition]) => [definition.column, { key, definition }]));
    const parsed = Papa.parse<string[]>(text, { dynamicTyping: false, skipEmptyLines: false });

    const result: VoucherPassCsv = {
        headers: (parsed.data[0] || []).map((value) => value.trim()),
        columnNames: Object.fromEntries(definitions.map(([key, definition]) => [key, definition.column])),
        rows: [],
        rowNumbers: [],
        errors: parsed.errors
            .filter((error) => error.code !== 'UndetectableDelimiter')
            .map((error) => ({ message: error.message })),
    };

    const headers = new Set<string>();

    for (const header of result.headers) {
        if (headers.has(header)) {
            result.errors.push({ column: header, message: translate('voucher_passes.errors.duplicate_header') });
        } else if (!columns.has(header)) {
            result.errors.push({ column: header, message: translate('voucher_passes.errors.unknown_header') });
        }

        headers.add(header);
    }

    for (const [column, { key }] of columns) {
        if (key !== 'print_label' && !headers.has(column)) {
            result.errors.push({ column, message: translate('voucher_passes.errors.missing_header', { column }) });
        }
    }

    if (result.errors.length) {
        return result;
    }

    const uids = new Map<string, number>();

    parsed.data.slice(1).forEach((cells, index) => {
        const rowNumber = index + 2;

        if (cells.every((cell) => !cell.trim())) {
            return;
        }

        if (cells.length !== result.headers.length) {
            result.errors.push({ row: rowNumber, message: translate('voucher_passes.errors.column_count') });
            return;
        }

        const values = Object.fromEntries(
            result.headers.map((header, index) => {
                const { key, definition } = columns.get(header);
                const value = cells[index].trim();

                if (!value && definition.required) {
                    result.errors.push({
                        row: rowNumber,
                        column: header,
                        message: translate('voucher_passes.errors.required'),
                    });
                }

                if (key === 'type_names' || key === 'fund_ids') {
                    const items = value ? value.split(',').map((item) => item.trim()) : [];

                    if (
                        items.some((item) =>
                            key === 'fund_ids'
                                ? !/^[1-9]\d*$/.test(item) || !Number.isSafeInteger(Number(item))
                                : !item,
                        )
                    ) {
                        result.errors.push({
                            row: rowNumber,
                            column: header,
                            message: translate(
                                key === 'fund_ids' ? 'voucher_passes.errors.funds' : 'voucher_passes.errors.types',
                            ),
                        });
                    }

                    return [key, key === 'fund_ids' ? [...new Set(items.map(Number))] : [...new Set(items)]];
                }

                if (definition.values) {
                    if (value && !Object.hasOwn(definition.values, value)) {
                        result.errors.push({
                            row: rowNumber,
                            column: header,
                            message: translate('voucher_passes.errors.option', {
                                values: Object.keys(definition.values).join(', '),
                            }),
                        });
                    }

                    return [key, definition.values[value]];
                }

                return [key, definition.normalize === 'bsn' ? normalizeBsn(value) : value || null];
            }),
        ) as unknown as VoucherPassInput;

        values.print_label = values.print_label ?? '';

        if (values.external_id !== null) {
            if (uids.has(values.external_id)) {
                result.errors.push({
                    row: rowNumber,
                    column: result.columnNames.external_id,
                    message: translate('voucher_passes.errors.duplicate_uid', { row: uids.get(values.external_id) }),
                });
            } else {
                uids.set(values.external_id, rowNumber);
            }
        }

        result.rows.push(values);
        result.rowNumbers.push(rowNumber);
    });

    if (!result.rows.length && !result.errors.length) {
        result.errors.push({ message: translate('voucher_passes.errors.no_rows') });
    }

    return result;
}
