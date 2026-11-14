import ProfileRecordGroup from '../../../props/models/ProfileRecordGroup';
import RecordType from '../../../props/models/RecordType';

export type ProfileGroupField = {
    key: string;
    name: string;
    sortOrder: number;
    recordType?: RecordType<string>;
};

export type ProfileFieldGroup = {
    group: ProfileRecordGroup | null;
    fields: ProfileGroupField[];
};
