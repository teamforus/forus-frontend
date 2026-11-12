import { Permission } from '../../props/models/Organization';
import { hasPermission } from '../../helpers/utils';
import useActiveOrganization from '../useActiveOrganization';

export default function useCanManageDCP(): boolean {
    const organization = useActiveOrganization();

    return !!(
        organization?.is_sponsor &&
        organization.has_dcp &&
        hasPermission(organization, Permission.MANAGE_IDENTITIES)
    );
}
