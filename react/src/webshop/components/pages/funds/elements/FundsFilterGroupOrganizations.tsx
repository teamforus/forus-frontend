import React from 'react';
import useTranslate from '../../../../../dashboard/hooks/useTranslate';
import Organization from '../../../../../dashboard/props/models/Organization';
import FundsFilterGroup from './base-group/FundsFilterGroup';
import { clickOnKeyEnter } from '../../../../../dashboard/helpers/wcag';
import classNames from 'classnames';

export default function FundsFilterGroupOrganizations({
    organizations,
    value,
    setValue,
    openByDefault = false,
}: {
    organizations: Array<Partial<Organization>>;
    value: number[];
    setValue: (selected: number[]) => void;
    openByDefault?: boolean;
}) {
    const translate = useTranslate();

    return (
        <FundsFilterGroup
            dusk={'fundFilterGroupOrganizations'}
            title={translate('funds.labels.organization')}
            controls={'organization_filters'}
            openByDefault={openByDefault}
            content={(isOpen) => (
                <div
                    id="organization_filters"
                    className="showcase-aside-group-body"
                    role="group"
                    aria-label={translate('funds.labels.organization')}
                    hidden={!isOpen}>
                    <div className="showcase-aside-block-options">
                        {organizations?.map((organization) => {
                            const isActive = value?.includes(organization.id);

                            return (
                                <div
                                    key={organization.id}
                                    role="button"
                                    tabIndex={0}
                                    aria-pressed={isActive}
                                    aria-label={organization.name}
                                    onClick={() => {
                                        setValue(
                                            value?.includes(organization.id)
                                                ? value?.filter((id) => id !== organization.id)
                                                : [...value, organization.id],
                                        );
                                    }}
                                    onKeyDown={(e) => clickOnKeyEnter(e, true)}
                                    className={classNames(
                                        'showcase-aside-block-option',
                                        isActive && 'showcase-aside-block-option-active',
                                    )}
                                    data-dusk={'fundOrganizationFilterOption' + organization.id}>
                                    <div className="showcase-aside-block-option-check">
                                        <em className="mdi mdi-check" aria-hidden="true" />
                                    </div>
                                    <div className="showcase-aside-block-option-name">{organization.name}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        />
    );
}
