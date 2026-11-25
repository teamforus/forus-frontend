import Media from './Media';
import type OrganizationBasic from './OrganizationBasic';
import OfficeSchedule from './OfficeSchedule';

export default interface Office {
    id: number;
    organization_id: number;
    address: string;
    phone: string | null;
    lon: string | null;
    lat: string | null;
    postcode: string | null;
    postcode_number: string | null;
    postcode_addition: string | null;
    photo: Media | null;
    branch_number?: string | null;
    branch_name?: string | null;
    branch_full_name?: string;
    branch_id?: string | null;
    employees_count?: number;
    organization: OrganizationBasic;
    schedule: Array<OfficeSchedule>;
}
