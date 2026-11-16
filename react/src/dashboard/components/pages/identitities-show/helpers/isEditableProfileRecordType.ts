import RecordType from '../../../../props/models/RecordType';

export default function isEditableProfileRecordType(recordType: RecordType<string>, organizationId: number): boolean {
    return (
        Boolean(recordType.profile_records) &&
        recordType.key !== 'bsn' &&
        (recordType.organization_id == null || recordType.organization_id === organizationId)
    );
}
