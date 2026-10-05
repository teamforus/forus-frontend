import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useTranslate from '../../../../dashboard/hooks/useTranslate';
import BlockShowcaseProfile from '../../elements/block-showcase/BlockShowcaseProfile';
import RecordType from '../../../../dashboard/props/models/RecordType';
import ProfileModel from '../../../../dashboard/props/models/Profile';
import { ProfileRecords, ProfileRecordType } from '../../../../dashboard/props/models/Sponsor/SponsorIdentity';
import useSetProgress from '../../../../dashboard/hooks/useSetProgress';
import { useRecordTypeService } from '../../../../dashboard/services/RecordTypeService';
import IdentityRecordKeyValueListHistory from './elements/IdentityRecordKeyValueListHistory';
import IdentityContactInformationCard from './cards/IdentityContactInformationCard';
import { useProfileService } from '../../../../dashboard/services/ProfileService';
import { differenceInYears } from 'date-fns';
import { dateParse } from '../../../../dashboard/helpers/dates';
import IdentityAddressCard from './cards/IdentityAddressCard';
import { WebshopRoutes } from '../../../modules/state_router/RouterBuilder';
import ProfileBankAccountsCard from './cards/ProfileBankAccountsCard';
import BlockKeyValueList from '../../elements/block-key-value-list/BlockKeyValueList';
import useAppConfigs from '../../../hooks/useAppConfigs';
import useAuthIdentity from '../../../hooks/useAuthIdentity';
import { useWalletService } from '../../../services/WalletService';
import usePushSuccess from '../../../../dashboard/hooks/usePushSuccess';
import usePushDanger from '../../../../dashboard/hooks/usePushDanger';
import { StringParam, useQueryParams } from 'use-query-params';
import { WalletFlow } from '../../../../dashboard/props/models/WalletFlow';

export default function Profile() {
    const translate = useTranslate();
    const setProgress = useSetProgress();
    const [profile, setProfile] = useState<ProfileModel>(null);

    const recordTypeService = useRecordTypeService();
    const profileService = useProfileService();

    const [recordTypes, setRecordTypes] = useState<Array<RecordType>>(null);
    const [disclosurePending, setDisclosurePending] = useState(false);

    const appConfigs = useAppConfigs();
    const identity = useAuthIdentity();
    const walletService = useWalletService();
    const pushSuccess = usePushSuccess();
    const pushDanger = usePushDanger();
    const disclosureHandled = useRef(false);
    const [disclosureResult, setDisclosureResult] = useQueryParams({
        disclosure_success: StringParam,
        wallet_error: StringParam,
    });

    const disclosureFlows = appConfigs?.wallet_disclosure_flows;

    const startDisclosure = useCallback(
        (flow: WalletFlow) => {
            setDisclosurePending(true);

            walletService
                .startDisclosure(flow)
                .then((res) => window.location.assign(res.data.redirect_url))
                .catch(() => {
                    setDisclosurePending(false);
                    pushDanger(translate('push.error'), translate('profile.disclosure.failed'));
                });
        },
        [walletService, pushDanger, translate],
    );

    useEffect(() => {
        if (disclosureHandled.current || (!disclosureResult.disclosure_success && !disclosureResult.wallet_error)) {
            return;
        }

        disclosureHandled.current = true;
        setDisclosureResult({ disclosure_success: undefined, wallet_error: undefined }, 'replaceIn');

        if (disclosureResult.wallet_error) {
            pushDanger(translate('push.error'), translate('profile.disclosure.failed'));
        } else {
            pushSuccess(translate('push.success'), translate('profile.disclosure.success'));
        }
    }, [disclosureResult, setDisclosureResult, pushDanger, pushSuccess, translate]);

    const fetchProfile = useCallback(() => {
        profileService.profile().then((res) => setProfile(res.data));
    }, [profileService]);

    const recordTypesByKey = useMemo(() => {
        return recordTypes?.reduce((map, recordType) => {
            return { ...map, [recordType.key]: recordType };
        }, {}) as ProfileRecords;
    }, [recordTypes]);

    const identityCalculatedAge = useMemo(() => {
        const birthDate = dateParse(profile?.records?.birth_date?.[0]?.value);

        return birthDate ? Math.max(differenceInYears(new Date(), birthDate), 0) : null;
    }, [profile?.records?.birth_date]);

    const fetchRecordTypes = useCallback(() => {
        setProgress(0);

        recordTypeService
            .list<RecordType & { key: ProfileRecordType }>()
            .then((res) => setRecordTypes(res.data))
            .finally(() => setProgress(100));
    }, [recordTypeService, setProgress]);

    useEffect(() => {
        fetchRecordTypes();
    }, [fetchRecordTypes]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return (
        <BlockShowcaseProfile
            breadcrumbItems={[
                { name: translate('profile.breadcrumbs.home'), state: WebshopRoutes.HOME },
                { name: translate('profile.breadcrumbs.profile') },
            ]}
            profileHeader={
                <div className="profile-content-header clearfix">
                    <div className="profile-content-title">
                        <h1 className="profile-content-header">{translate('profile.title')}</h1>
                    </div>
                </div>
            }>
            {profile && (
                <Fragment>
                    {identity && disclosureFlows?.length > 0 && (
                        <div className="card">
                            <div className="card-section">
                                <div className="button-group">
                                    {disclosureFlows.map((flow) => (
                                        <button
                                            key={flow.id}
                                            type="button"
                                            className="button button-primary"
                                            disabled={disclosurePending}
                                            onClick={() => startDisclosure(flow)}>
                                            {translate('profile.disclosure.button')}
                                            {disclosureFlows.length > 1 && ` (${flow.name})`}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div className="card-header flex">
                            <h2 className="card-title flex flex-grow">{translate('profile.personal.title')}</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: recordTypesByKey?.given_name?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory records={profile.records.given_name} />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.family_name?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory records={profile.records.family_name} />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.birth_date?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory records={profile.records.birth_date} />
                                        ),
                                    },
                                    {
                                        label: translate('profile.personal.age'),
                                        value: identityCalculatedAge || '-',
                                    },
                                    {
                                        label: recordTypesByKey?.gender?.name,
                                        value: <IdentityRecordKeyValueListHistory records={profile.records.gender} />,
                                    },
                                    {
                                        label: recordTypesByKey?.marital_status?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.marital_status}
                                            />
                                        ),
                                    },
                                    { label: translate('profile.personal.bsn'), value: profile?.bsn },
                                    {
                                        label: recordTypesByKey?.client_number?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.client_number}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">{translate('profile.household.title')}</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: recordTypesByKey?.house_composition?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.house_composition}
                                            />
                                        ),
                                    },
                                    {
                                        label: recordTypesByKey?.living_arrangement?.name,
                                        value: (
                                            <IdentityRecordKeyValueListHistory
                                                records={profile.records.living_arrangement}
                                            />
                                        ),
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <h2 className="card-title">{translate('profile.account.title')}</h2>
                        </div>
                        <div className="card-section">
                            <BlockKeyValueList
                                items={[
                                    {
                                        label: translate('profile.account.active_since'),
                                        value: profile?.created_at_locale,
                                    },
                                    {
                                        label: translate('profile.account.last_login'),
                                        value: profile?.last_login_at_locale,
                                    },
                                    {
                                        label: translate('profile.account.last_activity'),
                                        value: profile?.last_activity_at_locale,
                                    },
                                ]}
                            />
                        </div>
                    </div>

                    <IdentityContactInformationCard
                        profile={profile}
                        recordTypesByKey={recordTypesByKey}
                        setProfile={setProfile}
                    />

                    <IdentityAddressCard
                        profile={profile}
                        recordTypesByKey={recordTypesByKey}
                        setProfile={setProfile}
                    />

                    <ProfileBankAccountsCard bankAccounts={profile?.bank_accounts || []} />
                </Fragment>
            )}
        </BlockShowcaseProfile>
    );
}
