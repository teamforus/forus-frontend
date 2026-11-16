import React, { Fragment, useCallback, useEffect, useState } from 'react';
import useSetProgress from '../../../hooks/useSetProgress';
import useActiveOrganization from '../../../hooks/useActiveOrganization';
import { useParams } from 'react-router';
import StateNavLink from '../../../modules/state_router/StateNavLink';
import SponsorIdentity from '../../../props/models/Sponsor/SponsorIdentity';
import LoadingCard from '../../elements/loading-card/LoadingCard';
import useSponsorIdentitiesService from '../../../services/SponsorIdentitesService';
import Card from '../../elements/card/Card';
import CardBlockKeyValue from '../../elements/card/blocks/CardBlockKeyValue';
import { hasPermission } from '../../../helpers/utils';
import IdentityReimbursementsCard from './cards/IdentityReimbursementsCard';
import IdentityFundRequestsCard from './cards/IdentityFundRequestsCard';
import IdentityBankAccountsCard from './cards/IdentityBankAccountsCard';
import IdentityVouchersCard from './cards/IdentityVouchersCard';
import IdentityPayoutsCard from './cards/IdentityPayoutsCard';
import IdentityProfileRecordGroups from './cards/IdentityProfileRecordGroups';
import BlockCardEmails from '../../elements/block-card-emails/BlockCardEmails';
import useEmailLogService from '../../../services/EmailLogService';
import { Permission } from '../../../props/models/Organization';
import useProfileRecordTypes from './hooks/useProfileRecordTypes';
import BrpPersonCard from '../../elements/brp-person/BrpPersonCard';
import ProfileRelationsCard from './elements/ProfileRelationsCard';
import BlockCardNotes from '../../elements/block-card-notes/BlockCardNotes';
import Note from '../../../props/models/Note';
import { DashboardRoutes } from '../../../modules/state_router/RouterBuilder';
import { RequestConfig } from '../../../props/ApiResponses';
import useTranslate from '../../../hooks/useTranslate';
import Label from '../../elements/label/Label';
import useProfileRecordGroups from './hooks/useProfileRecordGroups';
import { ProfileFieldGroup } from './types';

const PREDEFINED_PROFILE_GROUP_KEYS = ['personal', 'house', 'contacts', 'address'];

export default function IdentitiesShow() {
    const identityId = parseInt(useParams().id);
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const activeOrganization = useActiveOrganization();

    const emailLogService = useEmailLogService();
    const sponsorIdentitiesService = useSponsorIdentitiesService();

    const [identity, setIdentity] = useState<SponsorIdentity>(null);

    const identityProviderManagement = identity?.identity_provider_management;

    const { recordTypes } = useProfileRecordTypes(activeOrganization.id);
    const profileRecordGroups = useProfileRecordGroups(recordTypes || [], activeOrganization.id, identity?.records);

    const fetchIdentity = useCallback(() => {
        setProgress(0);

        sponsorIdentitiesService
            .read(activeOrganization.id, identityId)
            .then((res) => setIdentity(res.data.data))
            .finally(() => setProgress(100));
    }, [activeOrganization.id, identityId, setProgress, sponsorIdentitiesService]);

    const fetchEmailLogs = useCallback(
        (query = {}, config: RequestConfig = {}) => {
            return emailLogService.list(activeOrganization.id, { identity_id: identity.id, ...query }, config);
        },
        [activeOrganization.id, identity?.id, emailLogService],
    );

    const fetchNotes = useCallback(
        (query = {}, config: RequestConfig = {}) => {
            return sponsorIdentitiesService.notes(activeOrganization.id, identity?.id, query, config);
        },
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    const deleteNote = useCallback(
        (note: Note) => {
            return sponsorIdentitiesService.noteDestroy(activeOrganization.id, identity?.id, note.id);
        },
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    const storeNote = useCallback(
        (data: { description: string }) => {
            return sponsorIdentitiesService.storeNote(activeOrganization.id, identity?.id, data);
        },
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    const fetchBrpPerson = useCallback(
        (data: object = {}) => sponsorIdentitiesService.getPersonBsn(activeOrganization.id, identity.id, data),
        [activeOrganization.id, identity?.id, sponsorIdentitiesService],
    );

    useEffect(() => {
        fetchIdentity();
    }, [fetchIdentity]);

    if (!identity || identity.id !== identityId || !recordTypes) {
        return <LoadingCard />;
    }

    const renderRecordGroups = (groups: ProfileFieldGroup[]) => (
        <IdentityProfileRecordGroups
            identity={identity}
            organization={activeOrganization}
            recordTypes={recordTypes}
            groups={groups}
            fetchIdentity={fetchIdentity}
        />
    );

    return (
        <Fragment>
            <div className="block block-breadcrumbs">
                <StateNavLink
                    className="breadcrumb-item"
                    name={DashboardRoutes.IDENTITIES}
                    activeExact={true}
                    params={{ organizationId: activeOrganization.id }}>
                    Personen
                </StateNavLink>
                <div className="breadcrumb-item active">#{identity.id}</div>
            </div>

            {/* personal details */}
            {renderRecordGroups(profileRecordGroups.filter(({ group }) => group?.key === 'personal'))}

            {/* account details */}
            <Card title={'Accountgegevens'}>
                <CardBlockKeyValue
                    size={'md'}
                    items={[
                        { label: 'Accountnummer', value: identity.id },
                        identity.type_locale ? { label: 'Account type', value: identity.type_locale } : null,
                        identity.employee_email ? { label: 'Aangemaakt door', value: identity.employee_email } : null,
                        ...(activeOrganization.bsn_enabled ? [{ label: 'BSN', value: identity.bsn }] : []),
                        { label: 'Hoofd e-mailadres', value: identity.email },
                        ...(identity.email_verified || []).map((email, index) => ({
                            label: `Extra e-mailadres ${index + 1}`,
                            value: email,
                        })),
                        identityProviderManagement
                            ? {
                                  label: translate('identities.entra.managed_by'),
                                  value: translate('identities.entra.provider_name'),
                              }
                            : null,
                        identityProviderManagement
                            ? {
                                  label: translate('identities.entra.account_status'),
                                  value: (
                                      <Label
                                          type={identityProviderManagement.status === 'active' ? 'success' : 'default'}>
                                          {identityProviderManagement.status === 'active'
                                              ? translate('identities.entra.active')
                                              : translate('identities.entra.disabled')}
                                      </Label>
                                  ),
                              }
                            : null,
                        { label: 'Aangemaakt op', value: identity.created_at_locale },
                        { label: 'Laatste inlog', value: identity.last_login_at_locale },
                        { label: 'Laatste handeling', value: identity.last_activity_at_locale },
                    ].filter((item) => item !== null)}
                />

                {identityProviderManagement && (
                    <div className="card-text">{translate('identities.entra.management_description')}</div>
                )}
            </Card>

            {/* brp details */}
            {activeOrganization.has_person_bsn_api && identity.bsn && <BrpPersonCard fetchPerson={fetchBrpPerson} />}

            {/* notes */}
            <BlockCardNotes showCreate={true} fetchNotes={fetchNotes} deleteNote={deleteNote} storeNote={storeNote} />

            {/* household details */}
            {renderRecordGroups(profileRecordGroups.filter(({ group }) => group?.key === 'house'))}

            {/* profile relations */}
            {activeOrganization.allow_profiles_relations && (
                <ProfileRelationsCard organization={activeOrganization} identity={identity} />
            )}

            {/* contact details */}
            {renderRecordGroups(profileRecordGroups.filter(({ group }) => group?.key === 'contacts'))}

            {/* address details */}
            {renderRecordGroups(profileRecordGroups.filter(({ group }) => group?.key === 'address'))}

            {/* custom record groups */}
            {renderRecordGroups(
                profileRecordGroups.filter(({ group }) => !PREDEFINED_PROFILE_GROUP_KEYS.includes(group?.key)),
            )}

            {/* bank accounts */}
            <IdentityBankAccountsCard
                identity={identity}
                organization={activeOrganization}
                fetchIdentity={fetchIdentity}
            />

            {/* vouchers */}
            {hasPermission(activeOrganization, [Permission.MANAGE_VOUCHERS, Permission.VIEW_VOUCHERS]) && (
                <IdentityVouchersCard organization={activeOrganization} identity={identity} />
            )}

            {/* payouts */}
            {activeOrganization.allow_payouts && hasPermission(activeOrganization, Permission.MANAGE_PAYOUTS) && (
                <IdentityPayoutsCard organization={activeOrganization} identity={identity} />
            )}

            {/* reimbursements */}
            {hasPermission(activeOrganization, Permission.MANAGE_REIMBURSEMENTS) && (
                <IdentityReimbursementsCard organization={activeOrganization} identity={identity} />
            )}

            {/* fund applications */}
            {hasPermission(activeOrganization, [Permission.VALIDATE_RECORDS, Permission.MANAGE_VALIDATORS], false) && (
                <IdentityFundRequestsCard organization={activeOrganization} identity={identity} />
            )}

            {/* email history */}
            <BlockCardEmails organization={activeOrganization} fetchLogEmails={fetchEmailLogs} />
        </Fragment>
    );
}
