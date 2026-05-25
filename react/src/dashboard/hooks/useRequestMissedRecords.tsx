import { useCallback, useMemo } from 'react';
import FundRequest, { FundRequestMissedRecord } from '../props/models/FundRequest';
import { groupBy } from 'lodash';
import useTranslate from './useTranslate';
import PrevalidationRequest, { PrevalidationRequestMissedRecord } from '../props/models/PrevalidationRequest';

type MissedRecord = FundRequestMissedRecord | PrevalidationRequestMissedRecord;

export default function useRequestMissedRecords(request: FundRequest | PrevalidationRequest) {
    const translate = useTranslate();

    const hasWarningMissedRecords = useMemo(() => {
        return !!request?.missed_records.filter((record) => record.type === 'warning').length;
    }, [request]);

    const hasInfoMissedRecords = useMemo(() => {
        return !!request?.missed_records.filter((record) => record.type === 'info').length;
    }, [request]);

    const infoMissedRecords = useMemo(() => {
        return groupBy(request?.missed_records.filter((record) => record.type === 'info') || [], 'group');
    }, [request]);

    const warningMissedRecords = useMemo(() => {
        return groupBy(request?.missed_records.filter((record) => record.type === 'warning') || [], 'group');
    }, [request]);

    const filterAndSortChildren = useCallback((list: { [_key: number]: Array<MissedRecord> }) => {
        const keys = Object.keys(list).filter((key) => key.startsWith('child_'));

        const recordsByChildNumber: { [key: string]: Array<MissedRecord> } = keys.reduce((carry, key) => {
            return {
                ...carry,
                [Number(key.split('_')[1])]: list[key],
            };
        }, {});

        return Object.fromEntries(Object.entries(recordsByChildNumber).sort(([a], [b]) => Number(a) - Number(b)));
    }, []);

    const infoMissedRecordsPerChild = useMemo((): { [_key: number]: Array<MissedRecord> } => {
        return filterAndSortChildren(infoMissedRecords);
    }, [filterAndSortChildren, infoMissedRecords]);

    const warningMissedRecordsPerChild = useMemo((): { [_key: number]: Array<MissedRecord> } => {
        return filterAndSortChildren(warningMissedRecords);
    }, [filterAndSortChildren, warningMissedRecords]);

    const missedRecordsText = useMemo(() => {
        const buildSection = (
            title: string,
            description: string,
            records: { [_key: string]: Array<MissedRecord> },
            recordsPerChild: { [_key: number]: Array<MissedRecord> },
            transKey: string,
        ) => {
            if (!Object.keys(records).length && !Object.keys(recordsPerChild).length) {
                return '';
            }

            let text = `${title}\n${description}\n`;

            // Person
            if (records.person?.length) {
                text += translate(`validation_requests.missed_records.labels.${transKey}.person`) + `: `;
                text += `${records.person
                    .map((record) => translate(`validation_requests.missed_records.person.${record.field}`))
                    .join(', ')}\n`;
            }

            // Family group
            if (records.partner?.length || records.children?.length || Object.keys(recordsPerChild).length) {
                text += translate(`validation_requests.missed_records.labels.${transKey}.family`) + `:\n`;

                if (records.partner?.length) {
                    text += `- ${translate(`validation_requests.missed_records.labels.${transKey}.partner`)}: `;
                    text += `${records.partner
                        .map((record) => translate(`validation_requests.missed_records.partner.${record.field}`))
                        .join(', ')}\n`;
                }

                if (records.children?.length) {
                    text += `- ${translate(`validation_requests.missed_records.labels.${transKey}.children_count`)}: `;
                    text += `${records.children
                        .map((record) => translate(`validation_requests.missed_records.children.${record.field}`))
                        .join(', ')}\n`;
                }

                if (Object.keys(recordsPerChild).length) {
                    text += `- ${translate(`validation_requests.missed_records.labels.${transKey}.children`)}: `;
                    text += Object.keys(recordsPerChild)
                        .map(
                            (i) =>
                                `${recordsPerChild[i]
                                    .map((record: MissedRecord) =>
                                        translate(`validation_requests.missed_records.child.${record.field}`, {
                                            number: i,
                                        }),
                                    )
                                    .join(', ')}`,
                        )
                        .join(', ');
                }

                text += `\n\n`;
            }

            return text;
        };

        const warningText = buildSection(
            translate('validation_requests.missed_records.labels.warning.title'),
            translate('validation_requests.missed_records.labels.warning.description'),
            warningMissedRecords,
            warningMissedRecordsPerChild,
            'warning',
        );

        const infoText = buildSection(
            translate('validation_requests.missed_records.labels.info.title'),
            translate('validation_requests.missed_records.labels.info.description'),
            infoMissedRecords,
            infoMissedRecordsPerChild,
            'info',
        );

        return [warningText, infoText].filter(Boolean).join('\n');
    }, [warningMissedRecords, warningMissedRecordsPerChild, infoMissedRecords, infoMissedRecordsPerChild, translate]);

    return {
        hasWarningMissedRecords,
        hasInfoMissedRecords,
        infoMissedRecords,
        warningMissedRecords,
        infoMissedRecordsPerChild,
        warningMissedRecordsPerChild,
        missedRecordsText,
    };
}
