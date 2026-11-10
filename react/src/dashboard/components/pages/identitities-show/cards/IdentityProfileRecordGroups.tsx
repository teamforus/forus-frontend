import React, { Fragment } from 'react';
import { differenceInYears } from 'date-fns';
import Organization, { Permission } from '../../../../props/models/Organization';
import SponsorIdentity from '../../../../props/models/Sponsor/SponsorIdentity';
import RecordType from '../../../../props/models/RecordType';
import { hasPermission } from '../../../../helpers/utils';
import { dateParse } from '../../../../helpers/dates';
import useTranslate from '../../../../hooks/useTranslate';
import Card from '../../../elements/card/Card';
import KeyValueItem from '../../../elements/key-value/KeyValueItem';
import EmptyCard from '../../../elements/empty-card/EmptyCard';
import IdentityRecordKeyValueWithHistory from '../elements/IdentityRecordKeyValueWithHistory';
import useEditProfileRecords from '../hooks/useEditProfileRecords';
import { ProfileFieldGroup } from '../types';

export default function IdentityProfileRecordGroups({
    identity,
    organization,
    recordTypes,
    groups,
    fetchIdentity,
}: {
    identity: SponsorIdentity;
    organization: Organization;
    recordTypes: RecordType<string>[];
    groups: ProfileFieldGroup[];
    fetchIdentity: () => void;
}) {
    const translate = useTranslate();
    const editRecords = useEditProfileRecords(organization, recordTypes);

    const canManage = organization.allow_profiles && hasPermission(organization, Permission.MANAGE_IDENTITIES);
    const birthDate = dateParse(identity.records.birth_date?.[0]?.value);
    const age = birthDate ? Math.max(differenceInYears(new Date(), birthDate), 0).toString() : null;

    return (
        <Fragment>
            {groups.map(({ group, fields }) => {
                const title = group?.name || translate('identities.profile_groups.fallback');
                const editableKeys = fields.filter((field) => field.recordType).map((field) => field.key);
                const availableKeys = editableKeys.filter((key) => !identity.records[key]?.[0]?.value);
                const rows = group ? fields : fields.filter((field) => identity.records[field.key]?.length);

                return (
                    <Card
                        key={group?.id ?? 'fallback'}
                        title={title}
                        section={false}
                        buttons={[
                            canManage &&
                                editableKeys.length > 0 && {
                                    text: translate('identities.profile_groups.edit_group'),
                                    icon: 'pencil-outline',
                                    onClick: () => editRecords(identity, title, fetchIdentity, editableKeys),
                                },
                            canManage &&
                                !group &&
                                availableKeys.length > 0 && {
                                    text: translate('identities.custom_records.add'),
                                    type: 'primary',
                                    icon: 'plus-circle',
                                    onClick: () => editRecords(identity, title, fetchIdentity, availableKeys, true),
                                },
                        ]}>
                        {rows.length === 0 ? (
                            <EmptyCard type="card-section" title={translate('identities.custom_records.empty')} />
                        ) : (
                            <div className="card-section">
                                <div className="card-block card-block-keyvalue card-block-keyvalue-md">
                                    {rows.map((field) => (
                                        <Fragment key={field.key}>
                                            <KeyValueItem label={field.name} className="text-black">
                                                <IdentityRecordKeyValueWithHistory
                                                    records={identity.records[field.key]}
                                                    onEdit={
                                                        canManage && field.recordType
                                                            ? () =>
                                                                  editRecords(identity, field.name, fetchIdentity, [
                                                                      field.key,
                                                                  ])
                                                            : undefined
                                                    }
                                                />
                                            </KeyValueItem>
                                            {field.key === 'birth_date' && (
                                                <KeyValueItem label={translate('identities.profile_groups.age')}>
                                                    {age ?? '---'}
                                                </KeyValueItem>
                                            )}
                                        </Fragment>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                );
            })}
        </Fragment>
    );
}
