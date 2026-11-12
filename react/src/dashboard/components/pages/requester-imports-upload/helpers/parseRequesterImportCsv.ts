import Papa from 'papaparse';
import { RequesterImportCsv } from '../types';
import { RequesterImportInput } from '../../../../props/models/RequesterImportRow';
import { normalizeBsn } from '../../../../helpers/string';
import { dateFormat, dateParse } from '../../../../helpers/dates';
import { RequesterImportMappingColumn } from '../../../../props/models/RequesterImportConfiguration';

export function parseRequesterImportCsv(
    text: string,
    allowedKeys: string[],
    translate: (key: string, options?: object) => string,
    mapping: Record<string, RequesterImportMappingColumn>,
): RequesterImportCsv {
    const columns = new Map(
        Object.entries(mapping)
            .filter(([key]) => allowedKeys.includes(key))
            .map(([key, definition]) => [definition.column, { key, definition }]),
    );

    const parsed = Papa.parse<string[]>(text, { dynamicTyping: false, skipEmptyLines: false });

    const result: RequesterImportCsv = {
        headers: (parsed.data[0] || []).map((value) => value.trim()),
        columnNames: Object.fromEntries(Object.entries(mapping).map(([key, definition]) => [key, definition.column])),
        rows: [],
        rowNumbers: [],
        errors: parsed.errors
            .filter((error) => error.code !== 'UndetectableDelimiter')
            .map((error) => ({ message: error.message })),
    };

    const headers = new Set<string>();

    for (const header of result.headers) {
        if (headers.has(header)) {
            result.errors.push({ column: header, message: translate('requester_imports.errors.duplicate_header') });
        } else if (!header || !columns.has(header)) {
            result.errors.push({ column: header, message: translate('requester_imports.errors.unknown_header') });
        }

        headers.add(header);
    }

    const bsnColumn = result.columnNames.bsn || 'bsn';

    if (!headers.has(bsnColumn)) {
        result.errors.push({ message: translate('requester_imports.errors.missing_bsn', { column: bsnColumn }) });
    }

    if (result.errors.length) {
        return result;
    }

    const bsns = new Map<string, number>();
    const clientNumbers = new Map<string, number>();

    parsed.data.slice(1).forEach((cells, index) => {
        const rowNumber = index + 2;

        if (cells.every((cell) => !cell.trim())) {
            return;
        }

        if (cells.length !== result.headers.length) {
            result.errors.push({ row: rowNumber, message: translate('requester_imports.errors.column_count') });
            return;
        }

        const row: RequesterImportInput = {
            bsn: '',
            ...Object.fromEntries(
                result.headers.map((header, index) => {
                    const { key, definition } = columns.get(header);
                    let value = cells[index].trim() || null;

                    if (value === null) {
                        return [key, null];
                    }

                    if (definition.normalize === 'bsn') {
                        value = normalizeBsn(value);
                    }

                    if (definition.date_format) {
                        const date = dateParse(value, definition.date_format);

                        if (!date || dateFormat(date, definition.date_format) !== value) {
                            result.errors.push({
                                row: rowNumber,
                                column: header,
                                message: translate('requester_imports.errors.invalid_date', {
                                    format: definition.date_format,
                                }),
                            });
                        } else {
                            value = dateFormat(date);
                        }
                    }

                    if (definition.values) {
                        if (!Object.hasOwn(definition.values, value)) {
                            result.errors.push({
                                row: rowNumber,
                                column: header,
                                message: translate('requester_imports.errors.invalid_option', {
                                    values: Object.keys(definition.values).join(', '),
                                }),
                            });
                        } else {
                            value = definition.values[value];
                        }
                    }

                    return [key, value];
                }),
            ),
        };

        const bsn = normalizeBsn(row.bsn);
        const weights = [9, 8, 7, 6, 5, 4, 3, 2, -1];
        const validBsn =
            /^[0-9]{9}$/.test(bsn || '') &&
            bsn !== '000000000' &&
            [...bsn].reduce((sum, digit, position) => sum + Number(digit) * weights[position], 0) % 11 === 0;

        if (!validBsn) {
            result.errors.push({
                row: rowNumber,
                column: bsnColumn,
                message: translate('requester_imports.errors.invalid_bsn'),
            });
        } else if (bsns.has(bsn)) {
            result.errors.push({
                row: rowNumber,
                column: bsnColumn,
                message: translate('requester_imports.errors.duplicate_value', { row: bsns.get(bsn) }),
            });
        } else {
            bsns.set(bsn, rowNumber);
        }

        if (row.client_number !== undefined && row.client_number !== null) {
            if (clientNumbers.has(row.client_number)) {
                result.errors.push({
                    row: rowNumber,
                    column: result.columnNames.client_number || 'client_number',
                    message: translate('requester_imports.errors.duplicate_value', {
                        row: clientNumbers.get(row.client_number),
                    }),
                });
            } else {
                clientNumbers.set(row.client_number, rowNumber);
            }
        }

        result.rows.push({ ...row, bsn });
        result.rowNumbers.push(rowNumber);
    });

    if (!result.rows.length && !result.errors.length) {
        result.errors.push({ message: translate('requester_imports.errors.no_rows') });
    }

    return result;
}
