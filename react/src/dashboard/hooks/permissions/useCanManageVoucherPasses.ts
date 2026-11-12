import { Permission } from '../../props/models/Organization';
import { hasPermission } from '../../helpers/utils';
import useActiveOrganization from '../useActiveOrganization';

export default function useCanManageVoucherPasses(): boolean {
    const organization = useActiveOrganization();

    return !!(
        organization?.is_sponsor &&
        organization.allow_voucher_passes &&
        organization.allow_profiles &&
        organization.bsn_enabled &&
        hasPermission(organization, Permission.MANAGE_IDENTITIES)
    );
}
