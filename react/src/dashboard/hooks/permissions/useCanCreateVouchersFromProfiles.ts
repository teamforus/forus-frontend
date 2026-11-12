import { Permission } from '../../props/models/Organization';
import { hasPermission } from '../../helpers/utils';
import useActiveOrganization from '../useActiveOrganization';

export default function useCanCreateVouchersFromProfiles(): boolean {
    const organization = useActiveOrganization();

    return !!(
        organization?.is_sponsor &&
        organization.allow_vouchers_from_profiles &&
        organization.allow_profiles &&
        organization.bsn_enabled &&
        hasPermission(organization, Permission.MANAGE_VOUCHERS) &&
        hasPermission(organization, [
            Permission.VIEW_FUNDS,
            Permission.MANAGE_FUNDS,
            Permission.MANAGE_PAYOUTS,
            Permission.VIEW_IDENTITIES,
            Permission.MANAGE_IDENTITIES,
            Permission.VIEW_FINANCES,
        ])
    );
}
