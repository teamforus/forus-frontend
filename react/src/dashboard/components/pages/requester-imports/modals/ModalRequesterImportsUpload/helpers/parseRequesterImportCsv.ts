import Papa from 'papaparse';
import { RequesterImportCsv } from '../types';
import { RequesterImportInput } from '../../../../../../props/models/RequesterImportRow';

export function parseRequesterImportCsv(
    text: string,
    allowedKeys: string[],
    translate: (key: string, options?: object) => string,
): RequesterImportCsv {
    const parsed = Papa.parse<string[]>(text, { dynamicTyping: false, skipEmptyLines: false });
    const result: RequesterImportCsv = {
        headers: (parsed.data[0] || []).map((value) => value.trim()),
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
        } else if (!header || !allowedKeys.includes(header)) {
            result.errors.push({ column: header, message: translate('requester_imports.errors.unknown_header') });
        }

        headers.add(header);
    }

    if (!headers.has('bsn')) {
        result.errors.push({ message: translate('requester_imports.errors.missing_bsn') });
    }

    if (result.errors.length) {
        return result;
    }

    const bsns = new Map<string, number>();
    const clientUuids = new Map<string, number>();

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
            ...Object.fromEntries(result.headers.map((key, column) => [key, cells[column].trim() || null])),
        };

        const bsn = /^\d{8}$/.test(row.bsn || '') ? row.bsn.padStart(9, '0') : row.bsn;
        const weights = [9, 8, 7, 6, 5, 4, 3, 2, -1];
        const validBsn =
            /^[0-9]{9}$/.test(bsn || '') &&
            bsn !== '000000000' &&
            [...bsn].reduce((sum, digit, position) => sum + Number(digit) * weights[position], 0) % 11 === 0;

        if (!validBsn) {
            result.errors.push({
                row: rowNumber,
                column: 'bsn',
                message: translate('requester_imports.errors.invalid_bsn'),
            });
        } else if (bsns.has(bsn)) {
            result.errors.push({
                row: rowNumber,
                column: 'bsn',
                message: translate('requester_imports.errors.duplicate_value', { row: bsns.get(bsn) }),
            });
        } else {
            bsns.set(bsn, rowNumber);
        }

        if (row.client_uuid !== undefined && row.client_uuid !== null) {
            if (clientUuids.has(row.client_uuid)) {
                result.errors.push({
                    row: rowNumber,
                    column: 'client_uuid',
                    message: translate('requester_imports.errors.duplicate_value', {
                        row: clientUuids.get(row.client_uuid),
                    }),
                });
            } else {
                clientUuids.set(row.client_uuid, rowNumber);
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
