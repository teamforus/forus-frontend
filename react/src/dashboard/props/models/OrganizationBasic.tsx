import Media from './Media';
import BusinessType from './BusinessType';

export default interface OrganizationBasic {
    id: number;
    name: string;
    business_type_id: number | null;
    email_public: boolean;
    phone_public: boolean;
    website_public: boolean;
    email: string | null;
    phone: string | null;
    website: string | null;
    logo: Media | null;
    business_type: BusinessType | null;
}
