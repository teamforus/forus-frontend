import RecordTypeOption from './RecordTypeOption';
import ProfileRecordGroup from './ProfileRecordGroup';
import RecordTypeOperator from './RecordTypeOperator';
import { ProfileRecordType } from './Sponsor/SponsorIdentity';

export default interface RecordType<T extends string = ProfileRecordType> {
    id: number;
    key: T;
    type: 'number' | 'string' | 'select' | 'bool' | 'date' | 'iban' | 'email' | 'select_number';
    control_type: 'text' | 'select' | 'checkbox' | 'date' | 'number' | 'step' | 'currency';
    system: boolean;
    criteria: boolean;
    requester_imports?: boolean;
    profile_records?: boolean;
    profile_requester_editable?: boolean;
    organization_id?: number | null;
    profile_record_group?: ProfileRecordGroup | null;
    profile_sort_order?: number;
    name: string;
    validations: Array<'date' | 'email' | 'iban' | 'min' | 'max'>;
    options: Array<RecordTypeOption>;
    operators?: Array<RecordTypeOperator>;
}
