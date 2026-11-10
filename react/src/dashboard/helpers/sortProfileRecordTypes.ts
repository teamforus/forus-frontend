import RecordType from '../props/models/RecordType';

export default function sortProfileRecordTypes(recordTypes: RecordType<string>[]): RecordType<string>[] {
    return [...recordTypes].sort((a, b) => {
        const groupA = a.profile_record_group;
        const groupB = b.profile_record_group;

        if (groupA && groupB) {
            const groupOrder = groupA.sort_order - groupB.sort_order || groupA.key.localeCompare(groupB.key);

            if (groupOrder !== 0) {
                return groupOrder;
            }
        } else if (groupA || groupB) {
            return Number(!groupA) - Number(!groupB);
        }

        return a.profile_sort_order - b.profile_sort_order || a.key.localeCompare(b.key);
    });
}
