import { Permission } from '../../props/models/Organization';
import { hasPermission } from '../../helpers/utils';
import useActiveOrganization from '../useActiveOrganization';

export default function useCanManageRequesterImports(): boolean {
    const organization = useActiveOrganization();

    return !!(
        organization?.is_sponsor &&
        organization.allow_requester_imports &&
        organization.allow_profiles &&
        organization.bsn_enabled &&
        hasPermission(organization, Permission.MANAGE_IDENTITIES)
    );
}
