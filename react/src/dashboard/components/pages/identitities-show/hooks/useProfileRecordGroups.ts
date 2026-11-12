import { useMemo } from 'react';
import RecordType from '../../../../props/models/RecordType';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import { ProfileFieldGroup } from '../types';
import isEditableProfileRecordType from '../helpers/isEditableProfileRecordType';
import sortProfileRecordTypes from '../../../../helpers/sortProfileRecordTypes';

export default function useProfileRecordGroups(
    recordTypes: RecordType<string>[],
    organizationId: number,
    records?: SponsorIdentity['records'],
) {
    return useMemo(() => {
        const groups = new Map<string | null, ProfileFieldGroup>();

        for (const type of sortProfileRecordTypes(recordTypes)) {
            if (type.key === 'bsn') {
                continue;
            }

            const history = records?.[type.key];
            const eligible = isEditableProfileRecordType(type, organizationId);

            if (!eligible && !history?.length) {
                continue;
            }

            const group = type.profile_record_group ?? null;
            const groupKey = group?.key || null;

            if (!groups.has(groupKey)) {
                groups.set(groupKey, { group, fields: [] });
            }

            groups.get(groupKey).fields.push({
                key: type.key,
                name: type.name,
                sortOrder: type.profile_sort_order,
                recordType: eligible ? type : undefined,
            });
        }

        return [...groups.values()];
    }, [organizationId, recordTypes, records]);
}
